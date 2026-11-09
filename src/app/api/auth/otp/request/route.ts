import { NextResponse } from "next/server"

import { backendFetch } from "@/lib/backend"
import { rateLimited, readJson, rejectCrossSite } from "@/lib/bff"

// Backend answers 204 whether or not the number matches an account (no enumeration); mirror that.
export async function POST(request: Request) {
  const blocked = rejectCrossSite(request, { json: true })
  if (blocked) return blocked
  const { mobile } = await readJson(request)
  if (typeof mobile !== "string" || !/^\+?\d{10,20}$/.test(mobile.trim())) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 })
  }
  try {
    const response = await backendFetch("/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: mobile.trim(), ...(process.env.OTP_TENANT_ID ? { tenant_id: process.env.OTP_TENANT_ID } : {}) }),
    })
    if (response.status === 429) return rateLimited(response, "Too many requests. Please try again later.")
    if (!response.ok) return NextResponse.json({ error: "Could not send a code. Please try again." }, { status: 502 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Could not reach the server. Please try again." }, { status: 502 })
  }
}
