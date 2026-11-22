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

/** Replace this subject's entry, keep every other subject's entry untouched. */
export function mergeEntries(existing: MarkEntry[] | null | undefined, subjectId: string, value: number): MarkEntry[] {
  const others = (existing ?? []).filter((e) => String(e.subject_id) !== subjectId)
  return [...others, { ...entryFor(existing, subjectId), subject_id: subjectId, marks: value }]
}

export function totalMarks(entries: MarkEntry[]): number {
  const sum = entries.reduce((t, e) => (Number.isFinite(Number(e.marks)) ? t + Number(e.marks) : t), 0)
  return Math.round(sum * 100) / 100
}

export type MarksPayloadRow =
  | { id: string; marks: number; marks_details: MarkEntry[] }
  | { id: string; reappear_marks_details: MarkEntry[] }

export function buildMarksPayload(opts: {
  rows: RegRow[]
  drafts: Record<string, string>
  subjectId: string
  maxMarks: number
  reappear: boolean
}) {
  const { rows, drafts, subjectId, maxMarks, reappear } = opts
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
    if (reappear) {
      payload.push({ id: row.id, reappear_marks_details: mergeEntries(row.reappear_marks_details, subjectId, parsed.value) })
    } else {
      const merged = mergeEntries(row.marks_details, subjectId, parsed.value)
      payload.push({ id: row.id, marks: totalMarks(merged), marks_details: merged })
    }
  }
  return { payload, errors, overwrites }
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
