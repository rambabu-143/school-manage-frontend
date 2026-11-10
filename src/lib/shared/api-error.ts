// Pure (no imports) so node can unit-test it directly.
export type ApiErrorKind =
  | "auth" | "forbidden" | "not_found" | "conflict" | "validation"
  | "rate_limited" | "unavailable" | "server" | "network" | "unknown"

export interface RowError { row: number; message: string }

export interface ParsedApiError {
  status: number | null
  kind: ApiErrorKind
  message: string
  /** field path (dotted, as sent by FastAPI) -> message */
  fieldErrors: Record<string, string>
  /** bulk-import rejections: per-row problems */
  rowErrors: RowError[]
  /** seconds, from a 429 Retry-After header */
  retryAfter: number | null
}

type Json = Record<string, unknown>
const isObj = (v: unknown): v is Json => !!v && typeof v === "object" && !Array.isArray(v)
const str = (v: unknown) => (typeof v === "string" && v ? v : undefined)

function kindOf(status: number | null): ApiErrorKind {
  if (status === null) return "network"
  if (status === 401) return "auth"
  if (status === 403) return "forbidden"
  if (status === 404) return "not_found"
  if (status === 409) return "conflict"
  if (status === 422) return "validation"
  if (status === 429) return "rate_limited"
  if (status === 503) return "unavailable"
  return status >= 500 ? "server" : "unknown"
}

const LOC_ROOTS = new Set(["body", "query", "path", "header", "cookie"])
/** FastAPI loc is ["body", ...field path]; a lone ["name"] is the field itself. */
export function locPath(loc: unknown[]): string {
  const parts = loc.length > 1 && LOC_ROOTS.has(String(loc[0])) ? loc.slice(1) : loc
  return parts.join(".")
}

function headerValue(headers: unknown, name: string): string | undefined {
  if (!headers) return undefined
  if (typeof (headers as { get?: unknown }).get === "function") {
    const v = (headers as { get(n: string): unknown }).get(name)
    if (v != null) return String(v)
  }
  if (isObj(headers)) {
    const key = Object.keys(headers).find((k) => k.toLowerCase() === name)
    if (key && headers[key] != null) return String(headers[key])
  }
  return undefined
}

/** Accepts seconds ("30") or an HTTP date. */
export function parseRetryAfter(value: string | undefined, now = Date.now()): number | null {
  if (!value) return null
  const n = Number(value)
  if (Number.isFinite(n)) return n >= 0 ? Math.ceil(n) : null
  const t = Date.parse(value)
  return Number.isNaN(t) ? null : Math.max(0, Math.ceil((t - now) / 1000))
}

function rowErrorsFrom(v: unknown): RowError[] {
  if (!Array.isArray(v)) return []
  return v.flatMap((e) =>
    isObj(e) && typeof e.row === "number" ? [{ row: e.row, message: String(e.message ?? e.error ?? "Invalid row") }] : []
  )
}

const FALLBACK: Partial<Record<ApiErrorKind, string>> = {
  auth: "Your session has expired. Please sign in again.",
  forbidden: "You do not have permission to do that.",
  not_found: "That record could not be found.",
  conflict: "This conflicts with existing data.",
  validation: "Please fix the highlighted fields.",
  rate_limited: "Too many requests. Please wait and try again.",
  unavailable: "This feature is not configured yet. Contact your administrator.",
  server: "The server hit an error. Please try again.",
  network: "Could not reach the server. Check your connection.",
}

export function parseApiError(error: unknown): ParsedApiError {
  const res = isObj(error) && isObj(error.response) ? error.response : undefined
  const status = res && typeof res.status === "number" ? res.status : null
  const kind = kindOf(status)
  const data = res?.data
  const fieldErrors: Record<string, string> = {}
  let rowErrors: RowError[] = []
  let message: string | undefined

  if (isObj(data)) {
    // BFF/backend shapes: {message,details:{field_errors}}, {detail: str | [..] | {message,errors}}, {error}
    const detail = data.detail
    const details = isObj(data.details) ? data.details : undefined
    message = str(data.message)
    const fe = details?.field_errors
    if (Array.isArray(fe)) {
      for (const e of fe) if (isObj(e) && str(e.field) && e.field !== "") fieldErrors[e.field as string] ??= String(e.message ?? "Invalid")
    }
    if (Array.isArray(detail)) {
      for (const e of detail) {
        if (!isObj(e)) continue
        const loc = Array.isArray(e.loc) ? locPath(e.loc) : ""
        if (loc) fieldErrors[loc] ??= String(e.msg ?? "Invalid")
      }
    } else if (isObj(detail)) {
      message ??= str(detail.message)
      rowErrors = rowErrorsFrom(detail.errors)
    } else {
      message ??= str(detail)
    }
    if (!rowErrors.length) rowErrors = rowErrorsFrom(data.errors ?? details?.errors)
    message ??= str(data.error)
  }

  const retryAfter = kind === "rate_limited" ? parseRetryAfter(headerValue(res?.headers, "retry-after")) : null
  if (kind === "rate_limited") {
    message = retryAfter != null ? `Too many requests. Try again in ${retryAfter}s.` : FALLBACK.rate_limited
  } else if (kind === "unavailable" && !message) {
    message = FALLBACK.unavailable
  } else if (kind === "validation" && !message) {
    message = FALLBACK.validation
  }
  // never surface raw 5xx/auth bodies as the headline
  if (kind === "server" || kind === "auth" || kind === "network") message = FALLBACK[kind]
  message ??= FALLBACK[kind] ?? "Something went wrong"
  return { status, kind, message, fieldErrors, rowErrors, retryAfter }
}
