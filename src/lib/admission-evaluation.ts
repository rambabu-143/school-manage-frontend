// Pure logic for admission evaluation writes (marks, attendance, room allocation). The backend
// stores marks_details as a free-form JSON list that a save REPLACES wholesale, and it silently
// skips rows it considers invalid, so everything is validated and merged here before sending.

export type MarkEntry = { subject_id?: string; marks?: number | string | null; [k: string]: unknown }
export type RegRow = {
  id: string
  registration_no?: string | null
  personal_details?: { name?: string } | null
  marks_details?: MarkEntry[] | null
  reappear_marks_details?: MarkEntry[] | null
  room_details?: { phase?: number | string; room_id?: string }[] | null
  attendance_details?: { phase?: number | string; attendance?: string }[] | null
  /** Optimistic-lock counter (admission_application.marks_version); absent on legacy rows. */
  version?: number | null
  gender?: string | null
  category?: string | null
  [k: string]: unknown
}

const MARKS_RE = /^\d+(\.\d{1,2})?$/

/** null = blank (untouched). Otherwise a number within [0, max] with at most 2 decimals, or an error. */
export function parseMarks(raw: string, max: number): { value: number } | { error: string } | null {
  const s = raw.trim()
  if (s === "") return null
  if (!MARKS_RE.test(s)) return { error: "Enter a number with at most 2 decimals" }
  const value = Number(s)
  if (value > max) return { error: `Cannot exceed ${max}` }
  return { value }
}

export function entryFor(entries: MarkEntry[] | null | undefined, subjectId: string): MarkEntry | undefined {
  return (entries ?? []).find((e) => String(e.subject_id) === subjectId)
}

/** Replace this subject's entry in place (keeps order), or append it. Other subjects are untouched. */
export function mergeEntries(existing: MarkEntry[] | null | undefined, subjectId: string, value: number, extra: Partial<MarkEntry> = {}): MarkEntry[] {
  const list = existing ?? []
  const next = { ...entryFor(list, subjectId), ...extra, subject_id: subjectId, marks: value }
  return list.some((e) => String(e.subject_id) === subjectId)
    ? list.map((e) => (String(e.subject_id) === subjectId ? next : e))
    : [...list, next]
}

export function totalMarks(entries: MarkEntry[]): number {
  const sum = entries.reduce((t, e) => (Number.isFinite(Number(e.marks)) ? t + Number(e.marks) : t), 0)
  return Math.round(sum * 100) / 100
}

export type MarksPayloadRow =
  | { id: string; marks: number; marks_details: MarkEntry[]; version?: number }
  | { id: string; reappear_marks_details: MarkEntry[]; version?: number }

export function buildMarksPayload(opts: {
  rows: RegRow[]
  drafts: Record<string, string>
  subjectId: string
  maxMarks: number
  reappear: boolean
  phase?: number
}) {
  const { rows, drafts, subjectId, maxMarks, reappear, phase } = opts
  // Legacy entries also carried phase and max_marks.
  const extra: Partial<MarkEntry> = { max_marks: maxMarks, ...(phase ? { phase } : {}) }
  const payload: MarksPayloadRow[] = []
  const errors: Record<string, string> = {}
  let overwrites = 0
  for (const row of rows) {
    const draft = drafts[row.id]
    if (draft === undefined) continue
    const parsed = parseMarks(draft, maxMarks)
    if (parsed === null) continue
    if ("error" in parsed) {
      errors[row.id] = parsed.error
      continue
    }
    const current = entryFor(reappear ? row.reappear_marks_details : row.marks_details, subjectId)
    if (current && Number(current.marks) === parsed.value) continue
    if (current) overwrites += 1
    // Send the loaded version so the server rejects the row if someone else saved since; omitted for legacy rows.
    const v = typeof row.version === "number" ? { version: row.version } : {}
    if (reappear) {
      payload.push({ id: row.id, reappear_marks_details: mergeEntries(row.reappear_marks_details, subjectId, parsed.value, extra), ...v })
    } else {
      const merged = mergeEntries(row.marks_details, subjectId, parsed.value, extra)
      payload.push({ id: row.id, marks: totalMarks(merged), marks_details: merged, ...v })
    }
  }
  return { payload, errors, overwrites }
}

/** After a partial save: keep the drafts of sent rows whose saved marks (fresh data) differ from the draft, flagged as failed. */
export function failedDrafts(opts: { rows: RegRow[]; drafts: Record<string, string>; sentIds: readonly string[]; subjectId: string; reappear: boolean }) {
  const keep: Record<string, string> = {}
  const errors: Record<string, string> = {}
  for (const id of opts.sentIds) {
    const row = opts.rows.find((r) => r.id === id)
    const draft = opts.drafts[id]
    if (draft === undefined) continue
    const saved = entryFor(opts.reappear ? row?.reappear_marks_details : row?.marks_details, opts.subjectId)
    if (!saved || Number(saved.marks) !== Number(draft)) {
      keep[id] = draft
      errors[id] = "Not saved by the server. Check and save again."
    }
  }
  return { drafts: keep, errors }
}

export const CONFLICT_MSG = "Changed by someone else. The latest marks are loaded; review and save again."

/** After a save with version conflicts (fresh data loaded): conflicted rows keep their draft with a reload message; other unsaved rows are handled by failedDrafts. */
export function draftsAfterSave(opts: { rows: RegRow[]; drafts: Record<string, string>; sentIds: readonly string[]; conflicts?: readonly string[]; subjectId: string; reappear: boolean }) {
  const conflicts = new Set(opts.conflicts ?? [])
  const rest = failedDrafts({ ...opts, sentIds: opts.sentIds.filter((id) => !conflicts.has(id)) })
  for (const id of conflicts) {
    if (opts.drafts[id] === undefined) continue
    rest.drafts[id] = opts.drafts[id]
    rest.errors[id] = CONFLICT_MSG
  }
  return { ...rest, conflictCount: conflicts.size }
}

/** Decision after the pre-save refetch: block on a failed/empty reload (a failed refetch resolves with stale cache), reconfirm if the payload changed, else save. */
export function decideSave(refetch: { isError: boolean; data?: unknown }, shown: unknown, built: unknown): "block" | "reconfirm" | "save" {
  if (refetch.isError || !refetch.data) return "block"
  return JSON.stringify(shown) === JSON.stringify(built) ? "save" : "reconfirm"
}

export function buildAttendanceBody(o: { phase: number; attendance: string; className: string; roomId: string }) {
  if (!["PRESENT", "ABSENT"].includes(o.attendance) || !Number.isInteger(o.phase) || o.phase < 1 || !o.className || !o.roomId) return null
  return { attendance_details: { phase: o.phase, attendance: o.attendance }, class: o.className, phase: o.phase, room_id: o.roomId }
}

export function buildAllocateBody(roomId: string | undefined, phase: number) {
  return roomId && Number.isInteger(phase) && phase >= 1 ? { room_id: roomId, phase } : null
}

export function currentRoom(row: RegRow, phase: number): string | undefined {
  return row.room_details?.find((e) => String(e.phase) === String(phase))?.room_id
}

export function currentAttendance(row: RegRow, phase: number): string | undefined {
  return row.attendance_details?.find((e) => String(e.phase) === String(phase))?.attendance
}
