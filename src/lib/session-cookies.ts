import type { cookies as nextCookies } from "next/headers"

import { decodeClaims } from "@/lib/jwt-claims"

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

// Secure in production. ALLOW_INSECURE_COOKIES=true is an explicit, temporary
// opt-out for a plain-HTTP deployment (no domain/TLS yet): browsers drop Secure
// cookies over http://, so login would silently fail. It is ignored when
// PUBLIC_ORIGIN is https, so a forgotten switch cannot weaken a TLS deployment.
// Every auth cookie must use this helper.
export function cookieSecure(): boolean {
  if (process.env.NODE_ENV !== "production") return false
  const insecureOk =
    process.env.ALLOW_INSECURE_COOKIES === "true" &&
    !(process.env.PUBLIC_ORIGIN ?? "").trim().toLowerCase().startsWith("https:")
  return !insecureOk
}

const baseCookieOptions = {
  httpOnly: true,
  secure: cookieSecure(),
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
  // Any normal sign-in/refresh ends an impersonation context: a parked admin
  // pair must never survive into another person's session.
  cookieStore.delete(ADMIN_ACCESS_TOKEN_COOKIE)
  cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE)
}

export function clearSessionCookies(cookieStore: CookieStore) {
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
  cookieStore.delete(ADMIN_ACCESS_TOKEN_COOKIE)
  cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE)
}

/** True only while the live access token itself carries the "imp" claim. The
 * parked admin cookies alone never prove an impersonation is active. */
export function isImpersonatingNow(cookieStore: CookieStore): boolean {
  return Boolean(decodeClaims(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value).imp)
}

/** True while the live access token carries "fsw" (a switch-student sub-session). */
export function isFamilySwitchNow(cookieStore: CookieStore): boolean {
  return Boolean(decodeClaims(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value).fsw)
}

/** Install the guardian token returned by switch-parent. Refuses (false) unless the live token carries "fsw". */
export function backToFamilyCookies(cookieStore: CookieStore, accessToken: string): boolean {
  if (!isFamilySwitchNow(cookieStore)) return false
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, { ...baseCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE })
  return true
}

/** Install the switch-student token (no refresh token: the guardian's own pair stays). Refuses (false) from any switched session. */
export function startFamilyCookies(cookieStore: CookieStore, accessToken: string, expiresInSeconds: number): boolean {
  if (isFamilySwitchNow(cookieStore) || isImpersonatingNow(cookieStore)) return false
  const maxAge = Number.isFinite(expiresInSeconds) && expiresInSeconds > 0 ? expiresInSeconds : ACCESS_TOKEN_MAX_AGE
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, { ...baseCookieOptions, maxAge })
  return true
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
      maxAge: expiresInSeconds,
    })
  }
  if (refresh) {
    // Dies with the impersonation token, so it cannot be picked up later.
    cookieStore.set(ADMIN_REFRESH_TOKEN_COOKIE, refresh, {
      ...baseCookieOptions,
      maxAge: expiresInSeconds,
    })
  }
  cookieStore.set(ACCESS_TOKEN_COOKIE, impersonationToken, {
    ...baseCookieOptions,
    maxAge: expiresInSeconds,
  })
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
}

/** Swap the parked admin pair back in. Returns false (and drops any stale
 * parked tokens) unless an impersonation is actually active right now. */
export function restoreAdminCookies(cookieStore: CookieStore): boolean {
  if (!isImpersonatingNow(cookieStore)) {
    cookieStore.delete(ADMIN_ACCESS_TOKEN_COOKIE)
    cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE)
    return false
  }
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
