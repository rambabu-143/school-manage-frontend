import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { authedBackendFetch, SessionExpiredError } from "@/lib/authed-backend-fetch"
import { setSessionCookies } from "@/lib/session-cookies"

type CookieStore = Awaited<ReturnType<typeof cookies>>

/** Backend error body -> plain message for the browser. */
export async function errorFrom(response: Response, fallback: string): Promise<NextResponse> {
  const body = (await response.json().catch(() => null)) as { detail?: unknown; message?: string } | null
  const detail = typeof body?.detail === "string" ? body.detail : body?.message
  const status = [400, 401, 403, 404, 409, 422, 429].includes(response.status) ? response.status : 502
  return NextResponse.json({ error: detail ?? fallback }, { status })
}

export function unauthenticated() {
  return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
}

/**
 * POST JSON to an authenticated backend path. On success `onOk` gets the
 * parsed body and the cookie store (to set rotated tokens) and returns the
 * browser response. Tokens never reach the browser.
 */
export async function postAuthed(
  path: string,
  payload: unknown,
  fallback: string,
  onOk: (data: unknown, cookieStore: CookieStore) => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  const cookieStore = await cookies()
  try {
    const response = await authedBackendFetch(cookieStore, path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {}),
    })
    if (!response.ok) return errorFrom(response, fallback)
    const text = await response.text()
    return onOk(text ? JSON.parse(text) : null, cookieStore)
  } catch (error) {
    if (error instanceof SessionExpiredError) return unauthenticated()
    return NextResponse.json({ error: "Could not reach the server. Please try again." }, { status: 502 })
  }
}

export function rotate(data: unknown, cookieStore: CookieStore) {
  setSessionCookies(cookieStore, data as { access_token: string; refresh_token: string })
  return NextResponse.json({ ok: true })
}

/**
 * CSRF guard for state-changing /api/auth routes. Rejects cross-site browser
 * requests (Sec-Fetch-Site / Origin) and, for routes with a body, anything that
 * is not application/json (so text/plain form posts are refused).
 * ponytail: replace with the shared isSameOriginRequest guard (PR #4,
 * src/lib/bff-guards.ts) once that is merged.
 */
export function rejectCrossSite(request: Request, opts: { json?: boolean } = {}): NextResponse | null {
  const site = request.headers.get("sec-fetch-site")
  if (site && site !== "same-origin" && site !== "none") {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 })
  }
  const origin = request.headers.get("origin")
  if (origin) {
    // Same host derivation as PR #4's bff-guards: first x-forwarded-host, else host.
    const host = (request.headers.get("x-forwarded-host")?.split(",")[0] ?? request.headers.get("host") ?? new URL(request.url).host).trim()
    const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
    let ok = false
    try {
      const o = new URL(origin)
      ok = o.host === host && (!proto || o.protocol === `${proto}:`)
    } catch {}
    if (!ok) return NextResponse.json({ error: "Request blocked." }, { status: 403 })
  }
  if (opts.json && !(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "Unsupported request." }, { status: 415 })
  }
  return null
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null)
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {}
}

export function isUuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}

/** 429 from the backend stays 429 and keeps its Retry-After. */
export function rateLimited(response: Response, message: string): NextResponse {
  const headers: Record<string, string> = {}
  const retry = response.headers.get("retry-after")
  if (retry) headers["Retry-After"] = retry
  return NextResponse.json({ error: message }, { status: 429, headers })
}
