import { cookies } from "next/headers"

import { backendFetch } from "@/lib/backend"
import { rejectCrossSite } from "@/lib/bff"
import { EVENT_COOKIE_PATH, EVENT_TOKEN_COOKIE, eventJson } from "@/lib/event-portal"

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request, { json: true })
  if (blocked) return blocked
  const input = await request.json().catch(() => null)
  if (typeof input?.email !== "string" || !input.email || typeof input?.password !== "string" || !input.password) {
    return eventJson({ error: "Email and password are required" }, 400)
  }
  const payload: Record<string, string> = { email: input.email, password: input.password }
  if (typeof input.tenant_id === "string" && input.tenant_id) payload.tenant_id = input.tenant_id
  try {
    const res = await backendFetch("/event-portal/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    const data = (await res.json().catch(() => null)) as { access_token?: string; expires_in?: number; name?: string; code?: string; type?: string } | null
    if (!res.ok || !data?.access_token) {
      const status = res.status === 429 ? 429 : res.status === 400 || res.status === 422 ? res.status : res.status === 401 || res.status === 403 || res.status === 404 ? 401 : 502
      return eventJson({ error: status === 429 ? "Too many attempts. Please try again later." : status === 401 ? "Invalid email or password" : "Could not sign in" }, status)
    }
    ;(await cookies()).set(EVENT_TOKEN_COOKIE, data.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: EVENT_COOKIE_PATH,
      maxAge: Math.min(Math.max(data.expires_in ?? 900, 60), 60 * 60 * 8),
    })
    return eventJson({ name: data.name, code: data.code, type: data.type })
  } catch {
    return eventJson({ error: "Could not reach the backend" }, 502)
  }
}
