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

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null)
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {}
}

export function isUuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}
