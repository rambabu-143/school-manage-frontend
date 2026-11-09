import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { authedBackendFetch, SessionExpiredError } from "@/lib/authed-backend-fetch"
import {
  buildResponseHeaders,
  buildUpstreamHeaders,
  isPlainJson,
  isSameOriginRequest,
  MAX_JSON_RESPONSE_BYTES,
  readBodyLimited,
  sanitizeErrorBody,
  stripTokenKeys,
  validateProxyPath,
} from "@/lib/bff-guards"

type RouteContext = { params: Promise<{ path: string[] }> }

const NO_STORE = { "Cache-Control": "private, no-store" }
const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status, headers: NO_STORE })

async function handle(request: Request, context: RouteContext): Promise<NextResponse> {
  if (!isSameOriginRequest(request.method, request.headers)) return fail("Cross-origin request blocked", 403)

  const { path } = await context.params
  const safePath = validateProxyPath(path)
  if (!safePath) return fail("Invalid path", 400)
  const targetPath = `${safePath}${new URL(request.url).search}`

  const hasBody = !["GET", "HEAD"].includes(request.method)
  let body: ArrayBuffer | undefined
  if (hasBody) {
    const read = await readBodyLimited(request)
    if (!read) return fail("Request body too large", 413)
    body = read
  }
  const cookieStore = await cookies()

  try {
    const response = await authedBackendFetch(cookieStore, targetPath, {
      method: request.method,
      headers: buildUpstreamHeaders(request.headers, hasBody),
      body,
      signal: request.signal, // client abort cancels the upstream call
    })

    const headers = buildResponseHeaders(response.headers)
    const generic = sanitizeErrorBody(response.status)
    if (generic) {
      await response.body?.cancel()
      headers.set("content-type", "application/json")
      return new NextResponse(generic, { status: response.status, headers })
    }
    const isJson = isPlainJson(response.headers.get("content-type"))
    if (isJson && response.status !== 204 && response.status !== 304 && request.method !== "HEAD") {
      if (Number(response.headers.get("content-length") ?? 0) > MAX_JSON_RESPONSE_BYTES) {
        await response.body?.cancel()
        return fail("Response too large", 502)
      }
      const raw = await response.text()
      if (raw.length > MAX_JSON_RESPONSE_BYTES) return fail("Response too large", 502)
      const { text, stripped } = stripTokenKeys(raw)
      if (stripped) console.warn(`[bff] stripped token fields from proxied response: ${request.method} ${safePath}`)
      headers.delete("content-length")
      return new NextResponse(text, { status: response.status, headers })
    }
    // Stream the upstream body through (PDFs, downloads) instead of buffering it.
    const noBody = response.status === 204 || response.status === 304 || request.method === "HEAD"
    return new NextResponse(noBody ? null : response.body, { status: response.status, headers })
  } catch (error) {
    if (error instanceof SessionExpiredError) return fail("Not authenticated", 401)
    return fail("Could not reach the backend", 502)
  }
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as DELETE,
  handle as PATCH,
}
