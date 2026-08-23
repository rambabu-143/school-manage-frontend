import { NextResponse, type NextRequest } from "next/server"

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/session-cookies"

const PUBLIC_PATHS = ["/login"]

/**
 * Coarse gate only: presence of a session cookie, not its validity - actual
 * token validity/refresh is handled per-request by authedBackendFetch in the
 * Route Handlers and Server Components that call the backend. Keeps this
 * fast on the Edge runtime instead of doing a network round-trip per navigation.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession =
    request.cookies.has(ACCESS_TOKEN_COOKIE) || request.cookies.has(REFRESH_TOKEN_COOKIE)
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  if (!hasSession && !isPublicPath) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (hasSession && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
