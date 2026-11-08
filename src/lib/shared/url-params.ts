// Pure URL-search-param helpers for server-driven lists and report filters.
export const MAX_PAGE_SIZE = 100
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZES = [10, 20, 50, 100] as const

export interface ListParams { page: number; limit: number; sort: string | null; dir: "asc" | "desc" }

const posInt = (v: string | null, fallback: number) => {
  const n = Number(v)
  return v !== null && Number.isInteger(n) && n >= 1 ? n : fallback
}

export function parseListParams(sp: URLSearchParams, defaults: Partial<ListParams> = {}): ListParams {
  const limit = Math.min(posInt(sp.get("limit"), defaults.limit ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
  const dir = sp.get("dir") ?? defaults.dir
  return {
    page: posInt(sp.get("page"), 1),
    limit,
    sort: sp.get("sort") ?? defaults.sort ?? null,
    dir: dir === "desc" ? "desc" : "asc",
  }
}

/** Returns a new query string (no leading "?"). null/undefined/"" delete a key.
 * Changing anything but `page` resets page to 1 (unless page is in the patch). */
export function patchSearch(current: URLSearchParams, patch: Record<string, string | number | null | undefined>): string {
  const next = new URLSearchParams(current)
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === "") next.delete(k)
    else next.set(k, String(v))
  }
  if (!("page" in patch)) next.delete("page")
  return next.toString()
}

const ISO = /^\d{4}-\d{2}-\d{2}$/
export const isIsoDate = (v: string | null): v is string => !!v && ISO.test(v) && !Number.isNaN(Date.parse(v))

/** Drops invalid dates and swaps an inverted range. */
export function normalizeDateRange(from: string | null, to: string | null): { from: string | null; to: string | null } {
  const f = isIsoDate(from) ? from : null
  const t = isIsoDate(to) ? to : null
  return f && t && f > t ? { from: t, to: f } : { from: f, to: t }
}

/** Params to forward to the API: only non-empty values. */
export function toApiParams(p: ListParams, extra: Record<string, string | null | undefined> = {}) {
  const out: Record<string, string | number> = { offset: (p.page - 1) * p.limit, limit: p.limit }
  if (p.sort) out.sort = `${p.dir === "desc" ? "-" : ""}${p.sort}`
  for (const [k, v] of Object.entries(extra)) if (v) out[k] = v
  return out
}
