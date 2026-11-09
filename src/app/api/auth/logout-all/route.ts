import { NextResponse } from "next/server"

import { postAuthed, rejectCrossSite } from "@/lib/bff"
import { clearSessionCookies } from "@/lib/session-cookies"

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request)
  if (blocked) return blocked
  return postAuthed("/auth/logout-all", {}, "Could not sign you out everywhere.", (_, cookieStore) => {
    clearSessionCookies(cookieStore)
    return NextResponse.json({ ok: true })
  })
}
