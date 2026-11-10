import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { backendFetch } from "@/lib/backend"
import { rejectCrossSite } from "@/lib/bff"

// Event users have their own backend token (separate from staff sessions). It lives
// only in this httpOnly cookie, scoped to the BFF routes below; the browser never sees it.
export const EVENT_TOKEN_COOKIE = "event_access_token"
export const EVENT_COOKIE_PATH = "/api/event-portal"

const NO_STORE = { "Cache-Control": "private, no-store" }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE })

/** Forward to a protected /event-portal backend path with the cookie's token. Same cross-site guards as /api/auth/*. */
export async function eventPortalProxy(request: Request, method: "GET" | "PUT" | "POST", backendPath: string, opts: { json?: boolean } = {}) {
  if (method !== "GET") {
    const blocked = rejectCrossSite(request, opts)
    if (blocked) return blocked
  }
  const token = (await cookies()).get(EVENT_TOKEN_COOKIE)?.value
  if (!token) return json({ error: "Please sign in again." }, 401)
  try {
    const body = opts.json ? JSON.stringify(await request.json().catch(() => ({}))) : undefined
    const res = await backendFetch(backendPath, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body,
    })
    const data = (await res.json().catch(() => null)) as { detail?: unknown } | null
    if (!res.ok) {
      const status = [400, 401, 403, 404, 409, 422, 429].includes(res.status) ? res.status : 502
      return json({ error: typeof data?.detail === "string" ? data.detail : "Request failed." }, status)
    }
    return json(data)
  } catch {
    return json({ error: "Could not reach the server. Please try again." }, 502)
  }
}

export { json as eventJson }
