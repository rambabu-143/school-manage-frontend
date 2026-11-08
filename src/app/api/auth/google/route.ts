import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { BackendError, backendFetch, getCurrentUser } from "@/lib/backend"
import { readJson } from "@/lib/bff"
import { decodeClaims } from "@/lib/jwt-claims"
import { setSessionCookies } from "@/lib/session-cookies"

const NONCE_COOKIE = "g_nonce"

export async function POST(request: Request) {
  const { id_token } = await readJson(request)
  const cookieStore = await cookies()
  const expected = cookieStore.get(NONCE_COOKIE)?.value
  cookieStore.delete({ name: NONCE_COOKIE, path: "/api/auth/google" })
  if (typeof id_token !== "string" || !id_token) {
    return NextResponse.json({ error: "Google sign-in did not finish. Please try again." }, { status: 400 })
  }
  // Payload is only read here; Google's signature/audience check is done by the backend below.
  if (!expected || decodeClaims(id_token).nonce !== expected) {
    return NextResponse.json({ error: "Google sign-in expired. Please try again." }, { status: 400 })
  }
  try {
    const response = await backendFetch("/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token }),
    })
    if (!response.ok) return NextResponse.json({ error: "We couldn't find an account for that Google user." }, { status: 401 })
    const result = await response.json()
    if ("requires_2fa" in result) return NextResponse.json(result)
    const user = await getCurrentUser(result.access_token)
    setSessionCookies(cookieStore, result)
    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof BackendError) return NextResponse.json({ error: "Could not sign you in." }, { status: 502 })
    return NextResponse.json({ error: "Could not reach the server. Please try again." }, { status: 502 })
  }
}
