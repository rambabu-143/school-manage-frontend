import { NextResponse } from "next/server"

import { readJson, rejectCrossSite } from "@/lib/bff"
import { requestPasswordReset } from "@/lib/backend"

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request, { json: true })
  if (blocked) return blocked
  const { email } = (await readJson(request)) as { email?: string }

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  // Always respond the same way regardless of outcome - the backend itself
  // never reveals whether the email matched an account, and neither should
  // this proxy.
  try {
    await requestPasswordReset(email)
  } catch {
    // ignore - backend unreachable shouldn't leak through as a distinct signal
  }
  return NextResponse.json({ ok: true })
}
