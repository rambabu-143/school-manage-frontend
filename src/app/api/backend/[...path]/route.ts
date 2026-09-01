import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { authedBackendFetch, SessionExpiredError } from "@/lib/authed-backend-fetch"

type RouteContext = { params: Promise<{ path: string[] }> }

async function handle(request: Request, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params
  const search = new URL(request.url).search
  const targetPath = `/${path.join("/")}${search}`

  const hasBody = !["GET", "HEAD"].includes(request.method)
  const contentType = request.headers.get("content-type") ?? undefined
  // multipart bodies (file uploads) carry a boundary in their Content-Type
  // that must be forwarded verbatim - re-encoding as JSON text would corrupt
  // the file bytes and drop the boundary.
  const isMultipart = contentType?.startsWith("multipart/form-data") ?? false
  const cookieStore = await cookies()

  try {
    const response = await authedBackendFetch(cookieStore, targetPath, {
      method: request.method,
      headers: hasBody ? { "Content-Type": isMultipart ? contentType! : "application/json" } : undefined,
      body: hasBody ? (isMultipart ? await request.arrayBuffer() : await request.text()) : undefined,
    })

    // arrayBuffer (not text) so binary responses like file downloads pass through intact.
    const body = await response.arrayBuffer()
    const headers: Record<string, string> = {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    }
    const disposition = response.headers.get("Content-Disposition")
    if (disposition) headers["Content-Disposition"] = disposition
    return new NextResponse(body.byteLength ? body : null, { status: response.status, headers })
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    return NextResponse.json({ error: "Could not reach the backend" }, { status: 502 })
  }
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as DELETE,
  handle as PATCH,
}
