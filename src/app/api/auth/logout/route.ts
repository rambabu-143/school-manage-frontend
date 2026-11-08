import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { backendFetch } from "@/lib/backend"
import { REFRESH_TOKEN_COOKIE, clearSessionCookies } from "@/lib/session-cookies"

export async function POST() {
  const cookieStore = await cookies()
  const refresh = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
  clearSessionCookies(cookieStore)
  if (refresh) {
    // Best effort: the cookies are already gone either way.
    await backendFetch("/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    }).catch(() => undefined)
  }
  return NextResponse.json({ ok: true })
}
