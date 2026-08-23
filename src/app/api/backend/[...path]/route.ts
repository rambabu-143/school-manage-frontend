import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { authedBackendFetch, SessionExpiredError } from "@/lib/authed-backend-fetch"

type RouteContext = { params: Promise<{ path: string[] }> }

async function handle(request: Request, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params
  const search = new URL(request.url).search
  const targetPath = `/${path.join("/")}${search}`

  const hasBody = !["GET", "HEAD"].includes(request.method)
  const cookieStore = await cookies()

  try {
    const response = await authedBackendFetch(cookieStore, targetPath, {
      method: request.method,
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? await request.text() : undefined,
    })

    const text = await response.text()
    return new NextResponse(text || null, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" },
    })
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    return NextResponse.json({ error: "Could not reach the backend" }, { status: 502 })
  }
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as DELETE,
  handle as PATCH,
}
