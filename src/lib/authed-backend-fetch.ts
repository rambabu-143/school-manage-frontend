import { cookies } from "next/headers"

import { BackendError, backendFetchWithToken, refreshRequest } from "@/lib/backend"
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearSessionCookies,
  setSessionCookies,
} from "@/lib/session-cookies"

type CookieStore = Awaited<ReturnType<typeof cookies>>

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired")
  }
}

/**
 * Calls the backend with the current session's access token. If the backend
 * says 401 (the token expired mid-session - cookie maxAge and JWT expiry
 * aren't guaranteed to line up exactly), refreshes once and retries. Updates
 * the session cookies in place either way. Throws SessionExpiredError if
 * there's no session or the refresh token itself is dead.
 */
export async function authedBackendFetch(
  cookieStore: CookieStore,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value

  if (!accessToken && !refreshToken) {
    throw new SessionExpiredError()
  }

  if (accessToken) {
    const response = await backendFetchWithToken(path, accessToken, init)
    if (response.status !== 401) return response
  }

  if (!refreshToken) {
    clearSessionCookies(cookieStore)
    throw new SessionExpiredError()
  }

  try {
    const tokens = await refreshRequest(refreshToken)
    setSessionCookies(cookieStore, tokens)
    return backendFetchWithToken(path, tokens.access_token, init)
  } catch (error) {
    if (error instanceof BackendError) {
      clearSessionCookies(cookieStore)
      throw new SessionExpiredError()
    }
    throw error
  }
}
