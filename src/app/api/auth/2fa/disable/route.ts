import { NextResponse } from "next/server"

import { postAuthed, readJson, rejectCrossSite } from "@/lib/bff"

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request, { json: true })
  if (blocked) return blocked
  const { password } = await readJson(request)
  if (typeof password !== "string" || !password) return NextResponse.json({ error: "Enter your password." }, { status: 400 })
  return postAuthed("/auth/2fa/disable", { password }, "Could not turn off two-step sign-in.", () => NextResponse.json({ ok: true }))
}
