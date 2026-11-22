// Pure payload builders for bulk session-promotion / rollover writes. Each returns null when the
// input is incomplete, so a caller can never submit an empty or half-filled bulk request.

export type Ids = readonly string[]

const uniq = (ids: Ids) => [...new Set(ids)]

export function buildStandardBody(gradeIds: Ids) {
  const grade_ids = uniq(gradeIds)
  return grade_ids.length ? { grade_ids } : null
}

export function buildSubjectsBody(subjectIds: Ids) {
  const subject_ids = uniq(subjectIds)
  return subject_ids.length ? { subject_ids } : null
}

export function buildComboSectionBody(sectionIds: Ids, targetYearId: string | undefined, promoteInNextClass: boolean) {
  const section_ids = uniq(sectionIds)
  if (!section_ids.length || !targetYearId) return null
  return { section_ids, target_academic_year_id: targetYearId, is_promote_in_next_class: promoteInNextClass }
}

export function buildStaffBody(sectionIds: Ids, targetYearId: string | undefined) {
  const section_ids = uniq(sectionIds)
  return section_ids.length && targetYearId ? { section_ids, target_academic_year_id: targetYearId } : null
}

export function buildHouseBody(sectionId: string | undefined) {
  return sectionId ? { section_id: sectionId } : null
}

/** Source and target years are required and must differ (a same-year rollover would duplicate masters). */
export function buildYearRolloverBody(src: string | undefined, dst: string | undefined) {
  return src && dst && src !== dst ? { source_academic_year_id: src, target_academic_year_id: dst } : null
}

export function buildChangeSectionBody(studentId: string | undefined, toSectionId: string | undefined, carryMarks: boolean) {
  return studentId && toSectionId ? { student_id: studentId, to_section_id: toSectionId, carry_marks: carryMarks } : null
}

// ---- siblings: draft = student_id -> sibling student ids (kept symmetric)
export type SiblingMap = Record<string, string[]>

export function linkSiblings(map: SiblingMap, ids: Ids): SiblingMap {
  const group = uniq(ids)
  const next: SiblingMap = { ...map }
  for (const id of group) next[id] = uniq([...(map[id] ?? []), ...group.filter((g) => g !== id)])
  return next
}

export function unlinkSibling(map: SiblingMap, a: string, b: string): SiblingMap {
  return { ...map, [a]: (map[a] ?? []).filter((x) => x !== b), [b]: (map[b] ?? []).filter((x) => x !== a) }
}

/** Only students whose sibling set changed; null when nothing changed. */
export function buildSiblingBody(original: SiblingMap, draft: SiblingMap) {
  const same = (x: string[], y: string[]) => x.length === y.length && x.every((v) => y.includes(v))
  const students = Object.keys(draft)
    .filter((id) => !same(original[id] ?? [], draft[id]))
    .map((student_id) => ({ student_id, sibling_student_ids: draft[student_id] }))
  return students.length ? { students } : null
}

/** One-line-per-field summary of a rollover result: arrays -> length, numbers -> value. */
export function summarizeResult(r: unknown): { counts: [string, number][]; skipped: { id: string; reason: string }[] } {
  const counts: [string, number][] = []
  let skipped: { id: string; reason: string }[] = []
  if (r && typeof r === "object") {
    for (const [k, v] of Object.entries(r)) {
      if (Array.isArray(v)) {
        counts.push([k, v.length])
        if (k === "skipped") skipped = v.map((s) => ({ id: String(s.id ?? s.student_id ?? ""), reason: String(s.reason ?? "") }))
      } else if (typeof v === "number") counts.push([k, v])
    }
  }
  return { counts, skipped }
}
