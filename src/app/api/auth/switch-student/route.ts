import { NextResponse } from "next/server"

import { isUuid, postAuthed, readJson, rejectCrossSite } from "@/lib/bff"
import { startFamilyCookies } from "@/lib/session-cookies"

// Guardian -> a linked student's login. The backend refuses this from any
// switched session; startFamilyCookies mirrors that so a refused call never
// replaces the cookie. Only the short-lived access token is swapped.
export async function POST(request: Request) {
  const blocked = rejectCrossSite(request, { json: true })
  if (blocked) return blocked
  const { student_id } = await readJson(request)
  if (!isUuid(student_id)) return NextResponse.json({ error: "Pick a child." }, { status: 400 })
  return postAuthed("/auth/switch-student", { student_id }, "Could not switch to this student.", (data, cookieStore) => {
    const t = data as { access_token: string; expires_in: number }
    if (!startFamilyCookies(cookieStore, t.access_token, t.expires_in)) {
      return NextResponse.json({ error: "You are already in a switched session." }, { status: 409 })
    }
    return NextResponse.json({ ok: true })
  })
}
