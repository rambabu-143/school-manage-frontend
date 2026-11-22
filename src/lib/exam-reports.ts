// Pure request builders and a response-to-table helper for the exam report endpoints
// (bluesheets, assessment record). Builders return null while required input is missing, so a
// half-filled form never fires a request. Response bodies are free-form objects in the contract.

export type ReportKind = "junior-bluesheet" | "junior-subject-bluesheet" | "senior-bluesheet" | "senior-exam-bluesheet" | "ar" | "ar-sections"

export interface ReportInput {
  wing?: string
  sectionId?: string
  subjectId?: string
  examId?: string
  yearId?: string
  term?: string
  startDate?: string
  endDate?: string
  tillCurrent?: boolean
}

export interface ReportRequest { path: string; params: Record<string, string | boolean> }

const TERMS = ["1", "2", "3"]
const AR_TERMS = ["1", "2", "csa"]

/** Valid term values per report (backend Literals); [] means the report takes no term. */
export function termsFor(kind: ReportKind): string[] {
  if (kind === "ar" || kind === "ar-sections") return AR_TERMS
  if (kind === "junior-bluesheet") return TERMS
  if (kind === "junior-subject-bluesheet") return ["1", "2"]
  return []
}
const WINGS = ["junior", "senior"]

export function buildReportRequest(kind: ReportKind, i: ReportInput): ReportRequest | null {
  const term = i.term && termsFor(kind).includes(i.term) ? i.term : undefined
  switch (kind) {
    case "junior-bluesheet":
      return i.sectionId && term ? { path: "/exam/junior/reports/bluesheet", params: { section_id: i.sectionId, term } } : null
    case "junior-subject-bluesheet":
    case "senior-bluesheet":
    case "senior-exam-bluesheet": {
      if (!i.sectionId) return null
      if (kind === "senior-bluesheet") return { path: "/exam/senior/reports/bluesheet", params: { section_id: i.sectionId } }
      if (kind === "senior-exam-bluesheet") return i.examId ? { path: "/exam/senior/reports/exam-bluesheet", params: { section_id: i.sectionId, exam_id: i.examId } } : null
      // subject bluesheet: term is 1 or 2; required for junior (backend 400), optional for senior
      if (!i.subjectId || !i.wing || !WINGS.includes(i.wing)) return null
      if (i.wing === "junior" && !term) return null
      const params: Record<string, string> = { section_id: i.sectionId, subject_id: i.subjectId }
      if (term) params.term = term
      return { path: `/exam/${i.wing}/reports/subject-bluesheet`, params }
    }
    case "ar":
      if (!i.wing || !WINGS.includes(i.wing) || !i.sectionId || !term || !i.startDate || !i.endDate || i.startDate > i.endDate) return null
      return { path: `/exam/${i.wing}/reports/ar`, params: { section_id: i.sectionId, term, start_date: i.startDate, end_date: i.endDate, ...(i.tillCurrent ? { till_current_date: true } : {}) } }
    case "ar-sections":
      return i.yearId && term ? { path: "/exam/junior/reports/ar-sections", params: { academic_year_id: i.yearId, term } } : null
  }
}

/** Approve bodies (junior only). Final bluesheet accepts term 1-3; subject bluesheet 1-2. */
export function buildApprove(kind: "bluesheet" | "subject-bluesheet", i: ReportInput) {
  if (!i.sectionId || !i.term) return null
  if (kind === "bluesheet") return TERMS.includes(i.term) ? { path: "/exam/junior/reports/bluesheet/approve", body: { section_id: i.sectionId, term: i.term } } : null
  if (!i.subjectId || (i.term !== "1" && i.term !== "2")) return null
  return { path: "/exam/junior/reports/subject-bluesheet/approve", body: { section_id: i.sectionId, subject_id: i.subjectId, term: i.term } }
}

type Row = Record<string, unknown>
const isRow = (v: unknown): v is Row => !!v && typeof v === "object" && !Array.isArray(v)

/** Shapes a free-form report body into a table: the first array of objects (or the body itself) is
 * the rows; scalar top-level fields come back as `meta`. Nested values are shown as JSON. */
export function toTable(data: unknown): { columns: string[]; rows: Row[]; meta: [string, string][] } {
  const meta: [string, string][] = []
  let rows: Row[] = []
  if (Array.isArray(data)) rows = data.filter(isRow)
  else if (isRow(data)) {
    for (const [k, v] of Object.entries(data)) {
      if (!rows.length && Array.isArray(v) && v.length && v.every(isRow)) rows = v as Row[]
      else if (v === null || typeof v !== "object") meta.push([k, String(v ?? "")])
    }
  }
  const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))]
  return { columns, rows, meta }
}

export function cell(v: unknown): string {
  if (v === null || v === undefined) return ""
  return typeof v === "object" ? JSON.stringify(v) : String(v)
}
