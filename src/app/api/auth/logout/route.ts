import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { clearSessionCookies } from "@/lib/session-cookies"

export async function POST() {
  const cookieStore = await cookies()
  clearSessionCookies(cookieStore)
  return NextResponse.json({ ok: true })
}
