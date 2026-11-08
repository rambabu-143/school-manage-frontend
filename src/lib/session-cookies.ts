import type { cookies as nextCookies } from "next/headers"

export const ACCESS_TOKEN_COOKIE = "access_token"
export const REFRESH_TOKEN_COOKIE = "refresh_token"
// While impersonating, the admin's own token pair is parked here (httpOnly,
// like the live session) and swapped back on exit. Never readable by JS.
export const ADMIN_ACCESS_TOKEN_COOKIE = "admin_access_token"
export const ADMIN_REFRESH_TOKEN_COOKIE = "admin_refresh_token"

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
  cookieStore.delete(ADMIN_ACCESS_TOKEN_COOKIE)
  cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE)
}

export function hasAdminStash(cookieStore: CookieStore): boolean {
  return Boolean(
    cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value ||
      cookieStore.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value
  )
}

/** Park the admin's pair and install the 15-minute impersonation token (no refresh token). */
export function startImpersonationCookies(
  cookieStore: CookieStore,
  impersonationToken: string,
  expiresInSeconds: number
) {
  const access = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  const refresh = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
  if (access) {
    cookieStore.set(ADMIN_ACCESS_TOKEN_COOKIE, access, {
      ...baseCookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    })
  }
  if (refresh) {
    cookieStore.set(ADMIN_REFRESH_TOKEN_COOKIE, refresh, {
      ...baseCookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    })
  }
  cookieStore.set(ACCESS_TOKEN_COOKIE, impersonationToken, {
    ...baseCookieOptions,
    maxAge: expiresInSeconds,
  })
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
}

/** Swap the parked admin pair back in. Returns false if nothing was parked. */
export function restoreAdminCookies(cookieStore: CookieStore): boolean {
  const access = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value
  const refresh = cookieStore.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value
  if (!access && !refresh) return false
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  if (access) {
    cookieStore.set(ACCESS_TOKEN_COOKIE, access, { ...baseCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE })
  }
  if (refresh) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, refresh, { ...baseCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE })
  } else {
    cookieStore.delete(REFRESH_TOKEN_COOKIE)
  }
  cookieStore.delete(ADMIN_ACCESS_TOKEN_COOKIE)
  cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE)
  return true
}
