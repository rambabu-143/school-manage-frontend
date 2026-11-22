import assert from "node:assert/strict"
import test from "node:test"

const P = await import("../src/lib/promotion-payloads.ts")

test("bulk bodies: empty selection is null, duplicates removed", () => {
  assert.equal(P.buildStandardBody([]), null)
  assert.deepEqual(P.buildStandardBody(["a", "a", "b"]), { grade_ids: ["a", "b"] })
  assert.equal(P.buildSubjectsBody([]), null)
  assert.deepEqual(P.buildSubjectsBody(["s"]), { subject_ids: ["s"] })
})

test("section+year bodies need both", () => {
  assert.equal(P.buildStaffBody(["s"], undefined), null)
  assert.equal(P.buildStaffBody([], "y"), null)
  assert.deepEqual(P.buildStaffBody(["s"], "y"), { section_ids: ["s"], target_academic_year_id: "y" })
  assert.deepEqual(P.buildComboSectionBody(["s"], "y", true), { section_ids: ["s"], target_academic_year_id: "y", is_promote_in_next_class: true })
  assert.equal(P.buildComboSectionBody(["s"], undefined, false), null)
  assert.equal(P.buildHouseBody(undefined), null)
  assert.deepEqual(P.buildHouseBody("h"), { section_id: "h" })
})

test("year rollover rejects same/missing years; change-section defaults", () => {
  assert.equal(P.buildYearRolloverBody("a", "a"), null)
  assert.equal(P.buildYearRolloverBody("a", undefined), null)
  assert.deepEqual(P.buildYearRolloverBody("a", "b"), { source_academic_year_id: "a", target_academic_year_id: "b" })
  assert.equal(P.buildChangeSectionBody("s", undefined, true), null)
  assert.deepEqual(P.buildChangeSectionBody("s", "t", false), { student_id: "s", to_section_id: "t", carry_marks: false })
})

test("siblings: link is symmetric and immutable, body only has changed students", () => {
  const orig = { a: [], b: ["c"], c: ["b"] }
  const linked = P.linkSiblings(orig, ["a", "b"])
  assert.deepEqual(orig.a, [])
  assert.deepEqual(linked.a, ["b"])
  assert.deepEqual(linked.b, ["c", "a"])
  assert.deepEqual(P.buildSiblingBody(orig, linked), { students: [{ student_id: "a", sibling_student_ids: ["b"] }, { student_id: "b", sibling_student_ids: ["c", "a"] }] })
  assert.equal(P.buildSiblingBody(orig, orig), null)
  const un = P.unlinkSibling(orig, "b", "c")
  assert.deepEqual([un.b, un.c], [[], []])
  assert.deepEqual(P.buildSiblingBody(orig, un), { students: [{ student_id: "b", sibling_student_ids: [] }, { student_id: "c", sibling_student_ids: [] }] })
})

test("summarizeResult: array lengths, numbers, skipped reasons", () => {
  const s = P.summarizeResult({ carried: ["a", "b"], skipped: [{ id: "x", reason: "nope" }, { student_id: "y", reason: "bad" }], unchanged: 3, other: "z" })
  assert.deepEqual(s.counts, [["carried", 2], ["skipped", 2], ["unchanged", 3]])
  assert.deepEqual(s.skipped, [{ id: "x", reason: "nope" }, { id: "y", reason: "bad" }])
  assert.deepEqual(P.summarizeResult(null), { counts: [], skipped: [] })
})
