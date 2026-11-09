import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { backendFetch } from "@/lib/backend"
import { rejectCrossSite } from "@/lib/bff"
import {
  ADMIN_REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearSessionCookies,
} from "@/lib/session-cookies"
import { forgetSingleFlight, refreshTokenKey } from "@/lib/single-flight"

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request)
  if (blocked) return blocked
  const cookieStore = await cookies()
  // While impersonating there is no refresh_token; the parked admin one must
  // be revoked too, or it would outlive the logout.
  const tokens = [REFRESH_TOKEN_COOKIE, ADMIN_REFRESH_TOKEN_COOKIE]
    .map((name) => cookieStore.get(name)?.value)
    .filter((t): t is string => Boolean(t))
  // A logged-out token must not be re-served from the 30 s refresh cache.
  for (const token of tokens) forgetSingleFlight(refreshTokenKey(token))
  clearSessionCookies(cookieStore)
  // Best effort: the cookies are already gone either way.
  await Promise.all(
    tokens.map((refresh_token) =>
      backendFetch("/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token }),
      }).catch(() => undefined)
    )
  )
  return NextResponse.json({ ok: true })
}
