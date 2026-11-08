import { NextResponse } from "next/server"

import { postAuthed } from "@/lib/bff"

export async function POST() {
  return postAuthed("/auth/2fa/setup", {}, "Could not start setup.", (data) => NextResponse.json(data))
}
