import type { cookies as nextCookies } from "next/headers"

export const ACCESS_TOKEN_COOKIE = "access_token"
export const REFRESH_TOKEN_COOKIE = "refresh_token"

// Access tokens are short-lived (15 min server-side); the cookie just needs
// to outlive that comfortably. Refresh tokens live for 30 days server-side.
const ACCESS_TOKEN_MAX_AGE = 60 * 20
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30

type CookieStore = Awaited<ReturnType<typeof nextCookies>>

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export function setSessionCookies(
  cookieStore: CookieStore,
  tokens: { access_token: string; refresh_token: string }
) {
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    ...baseCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
}

export function clearSessionCookies(cookieStore: CookieStore) {
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
}
