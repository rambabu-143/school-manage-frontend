// Payload builders/validators for exam promotion decisions and senior marks transfer / section change
// (backend src/exam: PUT /exam/promotions/{section}, POST /exam/senior/marks/transfer and /change-section).
// The backend stays authoritative; these only stop obvious mistakes before a request. Each builder
// returns { body, params? } or { error }.

export type Built<T> = { value: T; error?: undefined } | { value?: undefined; error: string }
const fail = (error: string): { error: string } => ({ error })

export interface PromotionRow { studentId: string; name: string; promotedTo: string; essentialRepeat: boolean; provisional: boolean }
export interface PromotionBody { session_begins: string; students: { student_id: string; promoted_to: string | null; is_essential_repeat: boolean; is_provisional_promoted: boolean }[] }

/** Map the GET /exam/promotions/{section} response rows into editable form rows. */
export function toPromotionRows(data: unknown): PromotionRow[] {
  const students = (data as { students?: Record<string, unknown>[] } | null)?.students ?? []
  return students.map((s) => ({
    studentId: String(s.student_id), name: String(s.name ?? s.admission_number ?? s.student_id),
    promotedTo: typeof s.promoted_to === "string" ? s.promoted_to : "",
    essentialRepeat: s.is_essential_repeat === true, provisional: s.is_provisional_promoted === true,
  }))
}

export function buildPromotionSave(sessionBegins: string, rows: readonly PromotionRow[]): Built<PromotionBody> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionBegins)) return fail("Session begins date is required")
  if (rows.length === 0) return fail("No students to save")
  return {
    value: {
      session_begins: sessionBegins,
      students: rows.map((r) => ({ student_id: r.studentId, promoted_to: r.promotedTo || null, is_essential_repeat: r.essentialRepeat, is_provisional_promoted: r.provisional })),
    },
  }
}

/** Students whose decision differs from what is saved (the preview shown before the overwrite). */
export function promotionChanges(saved: readonly PromotionRow[], edited: readonly PromotionRow[]): PromotionRow[] {
  const before = new Map(saved.map((r) => [r.studentId, r]))
  return edited.filter((r) => {
    const b = before.get(r.studentId)
    return !b || b.promotedTo !== r.promotedTo || b.essentialRepeat !== r.essentialRepeat || b.provisional !== r.provisional
  })
}

export interface MarkRow { subjectId: string; subject: string; examId: string; exam: string; examShort: string; subExamId: string; subExam: string; subShort: string; marks: string; missing?: boolean }

/** Flatten a student-marks `subjects` list (subject -> exams -> sub_exams) into one row per sub-exam, prefilled with any recorded mark. */
export function toMarkRows(subjects: unknown): MarkRow[] {
  const rows: MarkRow[] = []
  type Sub = { id: string; name: string; short_name?: string; marks?: { marks_obtain?: unknown } | null }
  type Exam = { id: string; exam_name: string; short_name?: string; sub_exams?: Sub[] }
  for (const s of (Array.isArray(subjects) ? subjects : []) as { subject_id: string; name: string; exams?: Exam[] }[]) {
    for (const e of s.exams ?? []) {
      for (const sub of e.sub_exams ?? []) {
        const m = sub.marks?.marks_obtain
        rows.push({ subjectId: s.subject_id, subject: s.name, examId: e.id, exam: e.exam_name, examShort: e.short_name ?? e.exam_name, subExamId: sub.id, subExam: sub.name, subShort: sub.short_name ?? sub.name, marks: m == null ? "" : String(m) })
      }
    }
  }
  return rows
}

/**
 * Sub-exams belong to one section, so marks read from the previous section must be written against the
 * CURRENT section's sub-exams. Prefill from previous, matched by subject + exam short name + sub-exam short
 * name (as the backend change-section does); a row with a mark but no match is flagged `missing`.
 */
export function matchToCurrent(previous: readonly MarkRow[], current: readonly MarkRow[]): MarkRow[] {
  return previous.map((p) => {
    const c = current.find((x) => x.subjectId === p.subjectId && x.examShort === p.examShort && x.subShort === p.subShort)
    return c ? { ...c, marks: p.marks } : { ...p, marks: p.marks, missing: true }
  })
}

/** Transfer body; only rows with a mark are sent. Backend: marks is a string of 1-20 chars; query section_id is the student's current section. */
export function buildTransfer(studentId: string, sectionId: string, rows: readonly MarkRow[]): Built<{ body: { student_id: string; transfer_marks: { subject_id: string; exam_id: string; sub_exam_id: string; marks: string }[] }; params: { section_id: string } }> {
  if (!studentId) return fail("Student is required")
  if (!sectionId) return fail("Current section is required")
  const items = rows.filter((r) => r.marks.trim() !== "")
  const lost = items.find((r) => r.missing)
  if (lost) return fail(`No matching sub-exam in the current section for ${lost.subject} / ${lost.subExam}; clear its mark to skip it`)
  if (items.length === 0) return fail("Enter at least one mark to transfer")
  if (items.some((r) => r.marks.trim().length > 20)) return fail("Marks must be at most 20 characters")
  return { value: { body: { student_id: studentId, transfer_marks: items.map((r) => ({ subject_id: r.subjectId, exam_id: r.examId, sub_exam_id: r.subExamId, marks: r.marks.trim() })) }, params: { section_id: sectionId } } }
}

/** Change-section body; query to_section_id is the new section, body from_section_id the old one. */
export function buildSectionChange(studentId: string, fromSectionId: string, toSectionId: string): Built<{ body: { student_id: string; from_section_id: string }; params: { to_section_id: string } }> {
  if (!studentId) return fail("Student is required")
  if (!fromSectionId || !toSectionId) return fail("Both sections are required")
  if (fromSectionId === toSectionId) return fail("From and to sections must differ")
  return { value: { body: { student_id: studentId, from_section_id: fromSectionId }, params: { to_section_id: toSectionId } } }
}

/** Fresh server list with the user's edits applied per student. Students added since loading keep their saved decision; removed ones are dropped. */
export function mergePromotion(fresh: readonly PromotionRow[], edited: readonly PromotionRow[] | null): PromotionRow[] {
  const mine = new Map((edited ?? []).map((r) => [r.studentId, r]))
  return fresh.map((f) => mine.get(f.studentId) ?? f)
}

/** True when the student list differs from what the user was editing. */
export function listChanged(loaded: readonly PromotionRow[], fresh: readonly PromotionRow[]): boolean {
  const a = new Set(loaded.map((r) => r.studentId))
  return a.size !== fresh.length || fresh.some((r) => !a.has(r.studentId))
}
