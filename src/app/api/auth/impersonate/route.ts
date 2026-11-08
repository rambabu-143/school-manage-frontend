import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { isUuid, postAuthed, readJson } from "@/lib/bff"
import { restoreAdminCookies, startImpersonationCookies } from "@/lib/session-cookies"

// Start: POST { user_id }. The admin pair is parked in httpOnly cookies.
export async function POST(request: Request) {
  const { user_id } = await readJson(request)
  if (!isUuid(user_id)) return NextResponse.json({ error: "Pick a person to view as." }, { status: 400 })
  return postAuthed("/auth/switch-user", { user_id }, "Could not switch to that person.", (data, cookieStore) => {
    const t = data as { access_token: string; expires_in: number }
    startImpersonationCookies(cookieStore, t.access_token, t.expires_in)
    return NextResponse.json({ ok: true })
  })
}

// Exit: swap the parked admin pair back in.
export async function DELETE() {
  const cookieStore = await cookies()
  if (!restoreAdminCookies(cookieStore)) {
    return NextResponse.json({ error: "You are not viewing as anyone." }, { status: 409 })
  }
  return NextResponse.json({ ok: true })
}
