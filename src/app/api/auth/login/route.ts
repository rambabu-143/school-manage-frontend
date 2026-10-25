import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { BackendError, getCurrentUser, loginRequest, verifyTwoFactorRequest } from "@/lib/backend"
import { setSessionCookies } from "@/lib/session-cookies"

export async function POST(request: Request) {
  const input = await request.json().catch(() => null)
  const isVerification = typeof input?.two_factor_token === "string" &&
    input.two_factor_token.length > 0 && typeof input?.code === "string" &&
    input.code.trim().length > 0
  const isLogin = typeof input?.email === "string" && input.email.length > 0 &&
    typeof input?.password === "string" && input.password.length > 0

  if (!isVerification && !isLogin) {
    return NextResponse.json({ error: "Email and password or a verification code are required" }, { status: 400 })
  }

  try {
    const result = isVerification
      ? await verifyTwoFactorRequest({ two_factor_token: input.two_factor_token, code: input.code })
      : await loginRequest(input.email, input.password)
    if ("requires_2fa" in result) {
      return NextResponse.json(result)
    }
    const user = await getCurrentUser(result.access_token)
    const cookieStore = await cookies()
    setSessionCookies(cookieStore, result)
    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(
        { error: error.status === 429 ? "Too many attempts. Please try again later." :
          isVerification ? "Invalid or expired verification code. Try again or restart sign in." : "Invalid email or password" },
        { status: [400, 401, 422, 429].includes(error.status) ? error.status : 502 }
      )
    }
    return NextResponse.json({ error: "Could not reach the backend" }, { status: 502 })
  }
}
