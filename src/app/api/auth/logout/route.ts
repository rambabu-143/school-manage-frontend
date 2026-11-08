import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { isSameOriginRequest } from "@/lib/bff-guards"
import { clearSessionCookies } from "@/lib/session-cookies"

export async function POST(request: Request) {
  if (!isSameOriginRequest("POST", request.headers)) {
    return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 })
  }
  const cookieStore = await cookies()
  clearSessionCookies(cookieStore)
  return NextResponse.json({ ok: true })
}
