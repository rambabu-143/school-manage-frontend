// Where a 401 from the API sends the browser. Backend 401 on login/refresh also
// means the user's school was removed (the API does not say which), so the
// login page explains that instead of a bare redirect.
export const LOGIN_PATH = "/login"
export const INACTIVE_REASON = "inactive"
export const INACTIVE_MESSAGE = "Your session ended or your school account is no longer active. Sign in again, or contact your school if this keeps happening."

/** Redirect target for a 401, or null when already on /login (loop guard). */
export function loginRedirectFor(pathname: string): string | null {
  return pathname === LOGIN_PATH ? null : `${LOGIN_PATH}?reason=${INACTIVE_REASON}`
}
