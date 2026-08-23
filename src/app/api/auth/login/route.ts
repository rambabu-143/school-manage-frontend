import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { BackendError, getCurrentUser, loginRequest } from "@/lib/backend"
import { setSessionCookies } from "@/lib/session-cookies"

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as {
    email?: string
    password?: string
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    )
  }

  try {
    const tokens = await loginRequest(email, password)
    const user = await getCurrentUser(tokens.access_token)

    const cookieStore = await cookies()
    setSessionCookies(cookieStore, tokens)

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: error.status === 401 ? 401 : 502 }
      )
    }
    return NextResponse.json(
      { error: "Could not reach the backend" },
      { status: 502 }
    )
  }
}
