import assert from "node:assert/strict"
import test from "node:test"

const E = await import("../src/lib/exam-reports.ts")

test("builders return null until required input is present", () => {
  assert.equal(E.buildReportRequest("junior-bluesheet", { sectionId: "s" }), null)
  assert.deepEqual(E.buildReportRequest("junior-bluesheet", { sectionId: "s", term: "2" }), { path: "/exam/junior/reports/bluesheet", params: { section_id: "s", term: "2" } })
  assert.equal(E.buildReportRequest("junior-bluesheet", { sectionId: "s", term: "9" }), null)
  assert.equal(E.buildReportRequest("senior-exam-bluesheet", { sectionId: "s" }), null)
  assert.equal(E.buildReportRequest("ar-sections", { term: "1" }), null)
})

test("subject bluesheet: wing validated, term optional 1-2 only", () => {
  const base = { wing: "senior", sectionId: "s", subjectId: "x" }
  assert.deepEqual(E.buildReportRequest("junior-subject-bluesheet", base)?.params, { section_id: "s", subject_id: "x" })
  assert.equal(E.buildReportRequest("junior-subject-bluesheet", { ...base, term: "3" })?.params.term, undefined)
  assert.equal(E.buildReportRequest("junior-subject-bluesheet", { ...base, term: "2" })?.params.term, "2")
  // junior needs a term (backend 400 otherwise)
  assert.equal(E.buildReportRequest("junior-subject-bluesheet", { ...base, wing: "junior" }), null)
  assert.equal(E.buildReportRequest("junior-subject-bluesheet", { ...base, wing: "junior", term: "3" }), null)
  assert.equal(E.buildReportRequest("junior-subject-bluesheet", { ...base, wing: "../x" }), null)
})

test("term options per report", () => {
  assert.deepEqual(E.termsFor("ar"), ["1", "2", "csa"])
  assert.deepEqual(E.termsFor("ar-sections"), ["1", "2", "csa"])
  assert.deepEqual(E.termsFor("junior-bluesheet"), ["1", "2", "3"])
  assert.deepEqual(E.termsFor("junior-subject-bluesheet"), ["1", "2"])
  assert.deepEqual(E.termsFor("senior-bluesheet"), [])
  assert.equal(E.buildReportRequest("ar-sections", { yearId: "y", term: "csa" })?.params.term, "csa")
  assert.equal(E.buildReportRequest("ar-sections", { yearId: "y", term: "3" }), null)
})

test("AR: dates required and ordered, till_current only when set", () => {
  const b = { wing: "junior", sectionId: "s", term: "1", startDate: "2025-04-01", endDate: "2025-09-30" }
  assert.equal(E.buildReportRequest("ar", b)?.params.till_current_date, undefined)
  assert.equal(E.buildReportRequest("ar", { ...b, tillCurrent: true })?.params.till_current_date, true)
  assert.equal(E.buildReportRequest("ar", { ...b, term: "csa" })?.params.term, "csa")
  assert.equal(E.buildReportRequest("ar", { ...b, term: "3" }), null)
  assert.equal(E.buildReportRequest("ar", { ...b, startDate: "2026-01-01" }), null)
  assert.equal(E.buildReportRequest("ar", { ...b, endDate: "" }), null)
})

test("approve bodies enforce term ranges", () => {
  assert.equal(E.buildApprove("bluesheet", { sectionId: "s" }), null)
  assert.deepEqual(E.buildApprove("bluesheet", { sectionId: "s", term: "3" })?.body, { section_id: "s", term: "3" })
  assert.equal(E.buildApprove("subject-bluesheet", { sectionId: "s", subjectId: "x", term: "3" }), null)
  assert.equal(E.buildApprove("subject-bluesheet", { sectionId: "s", term: "1" }), null)
  assert.equal(E.buildApprove("subject-bluesheet", { sectionId: "s", subjectId: "x", term: "2" })?.path, "/exam/junior/reports/subject-bluesheet/approve")
})

test("toTable finds rows, scalars become meta, nested shown as JSON", () => {
  const t = E.toTable({ section: "A", students: [{ n: "a", m: { x: 1 } }, { n: "b", z: 2 }], total: 2 })
  assert.deepEqual(t.columns, ["n", "m", "z"])
  assert.deepEqual(t.meta, [["section", "A"], ["total", "2"]])
  assert.equal(E.cell(t.rows[0].m), '{"x":1}')
  assert.equal(E.cell(null), "")
  assert.deepEqual(E.toTable(null), { columns: [], rows: [], meta: [] })
  assert.equal(E.toTable([{ a: 1 }]).rows.length, 1)
})
