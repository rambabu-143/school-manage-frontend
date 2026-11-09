import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { isSameOriginRequest } from "@/lib/bff-guards"
import { forgetSingleFlight, refreshTokenKey } from "@/lib/single-flight"
import { REFRESH_TOKEN_COOKIE, clearSessionCookies } from "@/lib/session-cookies"

export async function POST(request: Request) {
  if (!isSameOriginRequest("POST", request.headers)) {
    return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 })
  }
  const cookieStore = await cookies()
  const refresh = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
  if (refresh) forgetSingleFlight(refreshTokenKey(refresh)) // a logged-out token must not be re-served from the 30 s cache
  clearSessionCookies(cookieStore)
  return NextResponse.json({ ok: true })
}
