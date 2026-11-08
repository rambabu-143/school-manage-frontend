import { NextResponse } from "next/server"

import { postAuthed, readJson } from "@/lib/bff"

export async function POST(request: Request) {
  const { code } = await readJson(request)
  if (typeof code !== "string" || !code.trim()) return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 })
  return postAuthed("/auth/2fa/enable", { code: code.trim() }, "That code didn't work.", (data) => NextResponse.json(data))
}
