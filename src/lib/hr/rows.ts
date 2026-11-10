// Pure helpers for the HR / staff screens (unit-tested in tests/hr.test.mjs).

export type Row = Record<string, unknown>

export function humanize(key: string): string {
  const s = key.replace(/_/g, " ").trim()
  return s ? s[0].toUpperCase() + s.slice(1) : key
}

/** Display text for any JSON value; never "[object Object]". */
export function cellText(v: unknown): string {
  if (v === null || v === undefined || v === "") return "-"
  if (typeof v === "boolean") return v ? "Yes" : "No"
  if (typeof v === "object") return JSON.stringify(v)
  return String(v)
}

/** Union of keys across rows (first-seen order), id-like keys last, capped. */
export function columnKeys(rows: readonly Row[], max = 10): string[] {
  const seen: string[] = []
  for (const r of rows) for (const k of Object.keys(r)) if (!seen.includes(k)) seen.push(k)
  const isId = (k: string) => k === "id" || k.endsWith("_id") || k.endsWith("_ids")
  return [...seen.filter((k) => !isId(k)), ...seen.filter(isId)].slice(0, max)
}

export function toggleId(list: readonly string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

/** The rated teacher only ever receives per-section counts (no student rows). */
export function isCountsOnly(rows: readonly Row[]): boolean {
  return rows.length > 0 && rows.every((r) => "total_students" in r && !("student_id" in r))
}

export function sectionProgress(r: { total_students: number; rated: number; final_submitted: number }): string {
  return `${r.rated}/${r.total_students} rated, ${r.final_submitted} final`
}

export type BalanceCell = { carry_forward: string; credit_in_jan: string; credit_in_july: string }

/** Only edited cells with valid non-negative numbers are sent. */
export function balanceEntries(
  edits: Record<string, BalanceCell>
): { staff_id: string; leave_type_master_id: string; carry_forward: string; credit_in_jan: string; credit_in_july: string }[] {
  const ok = (v: string) => v.trim() !== "" && Number.isFinite(Number(v)) && Number(v) >= 0
  return Object.entries(edits)
    .map(([key, c]) => {
      const [staff_id, leave_type_master_id] = key.split(":")
      return { staff_id, leave_type_master_id, ...c }
    })
    .filter((e) => ok(e.carry_forward) && ok(e.credit_in_jan) && ok(e.credit_in_july))
}

export const WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const

/** Inclusive date range check on ISO dates. */
export function validRange(from: string, to: string): boolean {
  return !!from && !!to && from <= to
}
