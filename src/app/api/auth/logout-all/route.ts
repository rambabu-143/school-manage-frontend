import { NextResponse } from "next/server"

import { postAuthed } from "@/lib/bff"
import { clearSessionCookies } from "@/lib/session-cookies"

export async function POST() {
  return postAuthed("/auth/logout-all", {}, "Could not sign you out everywhere.", (_, cookieStore) => {
    clearSessionCookies(cookieStore)
    return NextResponse.json({ ok: true })
  })
}
