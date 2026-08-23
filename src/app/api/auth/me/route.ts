import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { authedBackendFetch, SessionExpiredError } from "@/lib/authed-backend-fetch"

export async function GET() {
  const cookieStore = await cookies()

  try {
    const response = await authedBackendFetch(cookieStore, "/auth/me")
    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    return NextResponse.json({ user: data })
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    return NextResponse.json({ error: "Could not reach the backend" }, { status: 502 })
  }
}
