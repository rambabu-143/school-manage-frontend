// Payload builders/validators for exam settings (grade settings, senior weightages, senior
// bluesheet settings). They mirror the backend schema limits (src/exam/schemas.py) so obvious
// mistakes fail before a request; the backend stays authoritative (it does NOT enforce any
// weightage sum, so neither do we). Each builder returns { body } or { error }.

export type Built<T> = { body: T; error?: undefined } | { body?: undefined; error: string }

export const COLUMN_FOR = ["bluesheet", "ar"] as const
export type ColumnFor = (typeof COLUMN_FOR)[number]

const num = (s: string): number | null => (s.trim() === "" || !Number.isFinite(Number(s)) ? null : Number(s))
const int = (s: string): number | null => {
  const n = num(s)
  return n !== null && Number.isInteger(n) ? n : null
}
const text = (label: string, s: string, max: number): string | null => {
  const t = s.trim()
  return t.length === 0 ? `${label} is required` : t.length > max ? `${label} must be at most ${max} characters` : null
}
const fail = (error: string): { error: string } => ({ error })

export interface GradeSettingForm { yearId: string; grade: string; gradeIds: string[]; min: string; max: string; order: string }

export function buildGradeSetting(f: GradeSettingForm): Built<{ academic_year_id: string; grade: string; grade_ids: string[]; min_marks: number; max_marks: number; order: number }> {
  if (!f.yearId) return fail("Academic year is required")
  const e = text("Grade", f.grade, 20)
  if (e) return fail(e)
  if (f.gradeIds.length === 0) return fail("Select at least one class")
  const min = num(f.min), max = num(f.max), order = int(f.order)
  if (min === null || min < 0) return fail("Min marks must be a number of 0 or more")
  if (max === null || max < 0) return fail("Max marks must be a number of 0 or more")
  if (min > max) return fail("Min marks must not exceed max marks")
  if (order === null) return fail("Order must be a whole number")
  return { body: { academic_year_id: f.yearId, grade: f.grade.trim(), grade_ids: f.gradeIds, min_marks: min, max_marks: max, order } }
}

export interface WeightageForm { yearId: string; gradeId: string; subjectId: string; columnName: string; shortName: string; formula: string; examIds: string[]; weightage: string; order: string }

export interface WeightageBody { column_name: string; short_name: string; formula: string; exam_name_ids: string[]; weightage: number; order: number }

function weightageFields(f: WeightageForm): Built<WeightageBody> {
  const e = text("Column name", f.columnName, 100) ?? text("Short name", f.shortName, 50) ?? text("Formula", f.formula, 100)
  if (e) return fail(e)
  if (f.examIds.length === 0) return fail("Select at least one exam")
  const w = num(f.weightage), order = int(f.order)
  if (w === null) return fail("Weightage must be a number")
  if (order === null) return fail("Order must be a whole number")
  return { body: { column_name: f.columnName.trim(), short_name: f.shortName.trim(), formula: f.formula.trim(), exam_name_ids: f.examIds, weightage: w, order } }
}

/** Create body: also needs year, class and subject. */
export function buildWeightageCreate(f: WeightageForm): Built<WeightageBody & { academic_year_id: string; grade_id: string; subject_id: string }> {
  if (!f.yearId || !f.gradeId || !f.subjectId) return fail("Academic year, class and subject are required")
  const r = weightageFields(f)
  return r.error !== undefined ? r : { body: { academic_year_id: f.yearId, grade_id: f.gradeId, subject_id: f.subjectId, ...r.body } }
}

/** Update body: the backend PUT accepts only the editable fields (year/class/subject are fixed). */
export const buildWeightageUpdate = weightageFields

export interface PartForm { examIds: string[]; formula: string; weightage: string; comparePart: string }
export interface BluesheetForm {
  yearId: string; gradeId: string; subjectId: string; columnName: string; columnFor: ColumnFor[]; term: string; maxMarks: string
  formula: string; isConverted: boolean; convertedMarks: string; parts: PartForm[]; addInTotal: boolean; addInTotalTerm1: boolean; order: string
}
export interface BluesheetBody {
  column_name: string; column_for: ColumnFor[]; term: string; max_marks: number; formula: string; is_converted: boolean
  converted_marks: number | null; description: { exam_name_ids: string[]; formula: string; weightage: number; compare_part: number | null }[]
  add_in_total: boolean; add_in_total_term1: boolean; order: number
}

function bluesheetFields(f: BluesheetForm): Built<BluesheetBody> {
  const e = text("Column name", f.columnName, 100)
  if (e) return fail(e)
  if (f.columnFor.length === 0) return fail("Choose bluesheet and/or AR")
  if (!f.term.trim()) return fail("Term is required")
  const max = num(f.maxMarks), order = int(f.order)
  if (max === null) return fail("Max marks must be a number")
  if (order === null) return fail("Order must be a whole number")
  let converted: number | null = null
  if (f.isConverted) {
    converted = num(f.convertedMarks)
    if (converted === null) return fail("Converted marks are required when converting")
  }
  const description: BluesheetBody["description"] = []
  for (const [i, p] of f.parts.entries()) {
    if (p.examIds.length === 0) return fail(`Part ${i + 1}: select at least one exam`)
    const w = num(p.weightage)
    if (w === null) return fail(`Part ${i + 1}: weightage must be a number`)
    if (!p.formula.trim()) return fail(`Part ${i + 1}: formula is required`)
    const cmp = p.comparePart.trim() === "" ? null : num(p.comparePart)
    if (p.comparePart.trim() !== "" && cmp === null) return fail(`Part ${i + 1}: compare part must be a number`)
    description.push({ exam_name_ids: p.examIds, formula: p.formula.trim(), weightage: w, compare_part: cmp })
  }
  return {
    body: {
      column_name: f.columnName.trim(), column_for: f.columnFor, term: f.term.trim(), max_marks: max, formula: f.formula.trim() || "no_formula",
      is_converted: f.isConverted, converted_marks: converted, description, add_in_total: f.addInTotal, add_in_total_term1: f.addInTotalTerm1, order,
    },
  }
}

export function buildBluesheetCreate(f: BluesheetForm): Built<BluesheetBody & { academic_year_id: string; grade_id: string; subject_id: string }> {
  if (!f.yearId || !f.gradeId || !f.subjectId) return fail("Academic year, class and subject are required")
  const r = bluesheetFields(f)
  return r.error !== undefined ? r : { body: { academic_year_id: f.yearId, grade_id: f.gradeId, subject_id: f.subjectId, ...r.body } }
}
export const buildBluesheetUpdate = bluesheetFields

export const emptyPart = (): PartForm => ({ examIds: [], formula: "", weightage: "", comparePart: "" })
