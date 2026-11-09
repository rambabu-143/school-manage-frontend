// Pure request/response guards for the /api/backend BFF proxy (unit-tested).

export const MAX_BODY_BYTES = 25 * 1024 * 1024
/** Largest JSON response buffered for token stripping; bigger ones are refused (502). */
export const MAX_JSON_RESPONSE_BYTES = 5 * 1024 * 1024

/** Plain JSON only; NDJSON / event-stream keep streaming. */
export const isPlainJson = (contentType: string | null) => /^application\/([\w.+-]+\+)?json\s*(;|$)/i.test(contentType ?? "")
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

/** CSRF: mutating requests must come from our own origin (Origin, else Sec-Fetch-Site). */
export function isSameOriginRequest(method: string, headers: Headers): boolean {
  if (SAFE_METHODS.has(method.toUpperCase())) return true
  const host = (headers.get("x-forwarded-host")?.split(",")[0] ?? headers.get("host"))?.trim()
  const origin = headers.get("origin")
  if (origin) {
    try {
      return !!host && new URL(origin).host === host
    } catch {
      return false
    }
  }
  const site = headers.get("sec-fetch-site")
  return site === "same-origin" || site === "none"
}

const DENIED_PREFIXES = ["docs", "redoc", "openapi.json", "metrics", "health", "event-portal/login"]
// auth/* is default-deny through the catch-all proxy: several endpoints return a
// TokenPair (login, refresh, 2fa/verify, switch-branch/year/user, otp/verify, google),
// which any XSS could read. Token flows live in dedicated /api/auth/* handlers.
// Only routes whose responses carry no tokens are allowed (checked against the OpenAPI snapshot).
const AUTH_ALLOWED = [/^auth\/me$/, /^auth\/session$/, /^auth\/users(\/[^/]+)?$/, /^auth\/2fa\/(setup|enable|disable)$/, /^auth\/otp\/request$/]
const SEGMENT_OK = /^[A-Za-z0-9._~:@!$&'()*+,;=-]+$/

/** Returns the safe upstream path ("/a/b") or null. Segments arrive already URL-decoded by Next. */
export function validateProxyPath(segments: string[]): string | null {
  if (!segments.length) return null
  for (const s of segments) {
    if (s === "." || s === ".." || !SEGMENT_OK.test(s)) return null
  }
  const joined = segments.join("/")
  const lower = joined.toLowerCase()
  if (DENIED_PREFIXES.some((p) => lower === p || lower.startsWith(`${p}/`))) return null
  if ((lower === "auth" || lower.startsWith("auth/")) && !AUTH_ALLOWED.some((re) => re.test(lower))) return null
  return `/${joined}`
}

/**
 * Defence in depth: strip access_token / refresh_token keys from a proxied JSON
 * body. Returns the (possibly rewritten) text and whether anything was stripped.
 */
export function stripTokenKeys(text: string): { text: string; stripped: boolean } {
  if (!/"(access_token|refresh_token)"/.test(text)) return { text, stripped: false }
  let found = false
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = Object.create(null) // null proto: a "__proto__" key stays a plain property
      for (const [k, val] of Object.entries(v)) {
        if (k === "access_token" || k === "refresh_token") found = true
        else out[k] = walk(val)
      }
      return out
    }
    return v
  }
  try {
    const cleaned = JSON.stringify(walk(JSON.parse(text)))
    return found ? { text: cleaned, stripped: true } : { text, stripped: false }
  } catch {
    return { text, stripped: false }
  }
}

/** Allow-list: never forwards Cookie, Host, Authorization, X-Forwarded-* from the browser. */
export function buildUpstreamHeaders(incoming: Headers, hasBody: boolean): Headers {
  const out = new Headers()
  for (const name of ["accept", "accept-language", "if-none-match", "if-match", "x-request-id"]) {
    const v = incoming.get(name)
    if (v) out.set(name, v)
  }
  if (hasBody) {
    const ct = incoming.get("content-type") ?? ""
    out.set("content-type", ct.startsWith("multipart/form-data") ? ct : "application/json")
  }
  return out
}

/** Allow-list of upstream response headers (drops Set-Cookie etc.) + forced no-store. */
export function buildResponseHeaders(upstream: Headers): Headers {
  const out = new Headers()
  for (const name of ["content-type", "content-disposition", "etag", "last-modified", "retry-after", "content-range", "accept-ranges"]) {
    const v = upstream.get(name)
    if (v) out.set(name, v)
  }
  if (!out.has("content-type")) out.set("content-type", "application/json")
  out.set("cache-control", "private, no-store")
  out.set("vary", "Cookie")
  out.set("x-content-type-options", "nosniff")
  return out
}

/** Upstream 5xx bodies can leak stack traces / internals: replace with a generic error. */
export function sanitizeErrorBody(status: number): string | null {
  return status >= 500 ? JSON.stringify({ error: "Upstream service error" }) : null
}

/** Reads a request body, rejecting (null) once it exceeds max bytes. */
export async function readBodyLimited(request: Request, max = MAX_BODY_BYTES): Promise<ArrayBuffer | null> {
  const declared = Number(request.headers.get("content-length") ?? 0)
  if (declared > max) return null
  if (!request.body) return new ArrayBuffer(0)
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > max) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  const buf = new Uint8Array(total)
  let off = 0
  for (const c of chunks) {
    buf.set(c, off)
    off += c.byteLength
  }
  return buf.buffer
}
