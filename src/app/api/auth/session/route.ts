import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { authedBackendFetch, SessionExpiredError } from "@/lib/authed-backend-fetch"
import { decodeClaims } from "@/lib/jwt-claims"
import { ACCESS_TOKEN_COOKIE } from "@/lib/session-cookies"

export async function GET() {
  const cookieStore = await cookies()
  try {
    const response = await authedBackendFetch(cookieStore, "/auth/session")
    if (!response.ok) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    const scope = (await response.json()) as { branch_id: string | null; academic_year_id: string | null }
    // Read after authedBackendFetch: it may have swapped or refreshed the token.
    const claims = decodeClaims(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value)
    return NextResponse.json({
      ...scope,
      impersonation: claims.imp ? { expires_at: (claims.exp ?? 0) * 1000 } : null,
    })
  } catch (error) {
    if (error instanceof SessionExpiredError) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    return NextResponse.json({ error: "Could not reach the server" }, { status: 502 })
  }
}
