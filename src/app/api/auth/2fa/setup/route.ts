import { NextResponse } from "next/server"

import { postAuthed, rejectCrossSite } from "@/lib/bff"

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request)
  if (blocked) return blocked
  return postAuthed("/auth/2fa/setup", {}, "Could not start setup.", (data) => NextResponse.json(data))
}
