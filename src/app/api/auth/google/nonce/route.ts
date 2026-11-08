import { randomBytes } from "node:crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const GOOGLE_NONCE_COOKIE = "g_nonce"

// Fresh nonce per attempt, bound to this browser by an httpOnly cookie. The
// ID token must echo it back, so a token minted for another page is rejected.
export async function GET() {
  const nonce = randomBytes(24).toString("base64url")
  ;(await cookies()).set(GOOGLE_NONCE_COOKIE, nonce, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/auth/google", maxAge: 600,
  })
  return NextResponse.json({ nonce })
}
