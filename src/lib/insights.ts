/** Pure helpers for the role dashboards and sidebar favourites. */

const iso = (d: Date) => d.toISOString().slice(0, 10)

/** Last `days` days ending today, as YYYY-MM-DD (UTC). */
export function defaultRange(now: Date, days = 30): { start: string; end: string } {
  return { start: iso(new Date(now.getTime() - days * 86_400_000)), end: iso(now) }
}

/** The backend rejects inverted ranges; check before calling. */
export function validRange(start: string, end: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end) && start <= end
}

/** Favourite menu key = the nav href. Keys the user no longer has access to are dropped. */
export function favouriteItems<T extends { href: string }>(items: readonly T[], keys: readonly string[] | undefined): T[] {
  const set = new Set(keys ?? [])
  return items.filter((i) => set.has(i.href))
}

/** Percent present among the marked, 0 when nothing is marked. */
export function presentPct(present: number, total: number): number {
  return total > 0 ? Math.round((present / total) * 100) : 0
}
