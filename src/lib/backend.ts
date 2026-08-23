// Server-only helpers for talking to the FastAPI backend. Never imported
// from client components - the access token stays server-side, in an
// httpOnly cookie, and is only ever attached to requests made from here.

const API_URL = process.env.API_URL ?? "http://localhost:8000/api/v1"

export class BackendError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`Backend request failed with status ${status}`)
    this.status = status
    this.body = body
  }
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/** Raw fetch against the backend - no auth attached. Used for login/refresh. */
export async function backendFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
  })
}

export async function loginRequest(email: string, password: string) {
  const body = new URLSearchParams({ username: email, password })
  const response = await backendFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  const data = await parseBody(response)
  if (!response.ok) throw new BackendError(response.status, data)
  return data as { access_token: string; refresh_token: string; token_type: string }
}

export async function refreshRequest(refreshToken: string) {
  const response = await backendFetch("/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  const data = await parseBody(response)
  if (!response.ok) throw new BackendError(response.status, data)
  return data as { access_token: string; refresh_token: string; token_type: string }
}

/** Authenticated request against the backend using an already-valid access token. */
export async function backendFetchWithToken(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.set("Authorization", `Bearer ${accessToken}`)
  return backendFetch(path, { ...init, headers })
}

export async function getCurrentUser(accessToken: string) {
  const response = await backendFetchWithToken("/auth/me", accessToken)
  const data = await parseBody(response)
  if (!response.ok) throw new BackendError(response.status, data)
  return data
}
