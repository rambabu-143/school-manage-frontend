import { NextResponse } from "next/server"

import { backendFetch } from "@/lib/backend"
import { readJson } from "@/lib/bff"

// Backend answers 204 whether or not the number matches an account (no enumeration); mirror that.
export async function POST(request: Request) {
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
    if (response.status === 429) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    if (!response.ok) return NextResponse.json({ error: "Could not send a code. Please try again." }, { status: 502 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Could not reach the server. Please try again." }, { status: 502 })
  }
}
