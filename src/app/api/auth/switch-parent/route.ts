import { NextResponse } from "next/server"

import { postAuthed, rejectCrossSite } from "@/lib/bff"
import { backToFamilyCookies } from "@/lib/session-cookies"

// Back to the guardian who started a switch-student session. The backend only
// honours this for a token carrying "fsw", and only to that origin guardian.
export async function POST(request: Request) {
  const blocked = rejectCrossSite(request)
  if (blocked) return blocked
  return postAuthed("/auth/switch-parent", {}, "Could not switch back.", (data, cookieStore) => {
    const t = data as { access_token: string }
    if (!backToFamilyCookies(cookieStore, t.access_token)) {
      return NextResponse.json({ error: "You are not in a family switch." }, { status: 409 })
    }
    return NextResponse.json({ ok: true })
  })
}
