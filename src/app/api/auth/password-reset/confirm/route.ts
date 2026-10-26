import { NextResponse } from "next/server"

import { BackendError, confirmPasswordReset } from "@/lib/backend"

export async function POST(request: Request) {
  const { token, newPassword } = (await request.json()) as {
    token?: string
    newPassword?: string
  }

  if (!token || !newPassword) {
    return NextResponse.json(
      { error: "Token and new password are required" },
      { status: 400 }
    )
  }

  try {
    await confirmPasswordReset(token, newPassword)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired" },
        { status: error.status === 400 ? 400 : 502 }
      )
    }
    return NextResponse.json({ error: "Could not reach the backend" }, { status: 502 })
  }
}
