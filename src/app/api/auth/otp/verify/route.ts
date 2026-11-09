import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { BackendError, backendFetch, getCurrentUser } from "@/lib/backend"
import { rateLimited, readJson, rejectCrossSite } from "@/lib/bff"
import { setSessionCookies } from "@/lib/session-cookies"

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request, { json: true })
  if (blocked) return blocked
  const { mobile, otp } = await readJson(request)
  if (typeof mobile !== "string" || typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: "Enter the 6-digit code we sent you." }, { status: 400 })
  }
  try {
    const response = await backendFetch("/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: mobile.trim(), otp, ...(process.env.OTP_TENANT_ID ? { tenant_id: process.env.OTP_TENANT_ID } : {}) }),
    })
    if (response.status === 429) return rateLimited(response, "Too many attempts. Please try again later.")
    if (!response.ok) return NextResponse.json({ error: "That code is wrong or has expired." }, { status: 401 })
    const tokens = await response.json()
    const user = await getCurrentUser(tokens.access_token)
    setSessionCookies(await cookies(), tokens)
    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof BackendError) return NextResponse.json({ error: "Could not sign you in." }, { status: 502 })
    return NextResponse.json({ error: "Could not reach the server. Please try again." }, { status: 502 })
  }
}
