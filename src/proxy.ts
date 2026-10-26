import { NextResponse, type NextRequest } from "next/server"

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/session-cookies"

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"]
// Only these bounce an already-authenticated visitor away - a logged-in user
// might still legitimately need /reset-password (e.g. a stale/expired
// cookie, or resetting a different account's password from a shared link).
const REDIRECT_IF_AUTHENTICATED_PATHS = ["/login"]

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

  if (hasSession && REDIRECT_IF_AUTHENTICATED_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
