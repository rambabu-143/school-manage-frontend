import assert from "node:assert/strict"
import test from "node:test"

const P = await import("../src/lib/exam-promotions.ts")
const row = (o = {}) => ({ studentId: "s1", name: "A", promotedTo: "sec2", essentialRepeat: false, provisional: true, ...o })

test("promotion save: body shape, blank target -> null", () => {
  assert.deepEqual(P.buildPromotionSave("2026-04-01", [row(), row({ studentId: "s2", promotedTo: "" })]).value, {
    session_begins: "2026-04-01",
    students: [
      { student_id: "s1", promoted_to: "sec2", is_essential_repeat: false, is_provisional_promoted: true },
      { student_id: "s2", promoted_to: null, is_essential_repeat: false, is_provisional_promoted: true },
    ],
  })
})
test("promotion save: validation", () => {
  assert.match(P.buildPromotionSave("", [row()]).error, /date/)
  assert.match(P.buildPromotionSave("04/01/2026", [row()]).error, /date/)
  assert.match(P.buildPromotionSave("2026-04-01", []).error, /No students/)
})
test("promotion changes: only differing rows", () => {
  const saved = [row(), row({ studentId: "s2" })]
  assert.deepEqual(P.promotionChanges(saved, [row(), row({ studentId: "s2", essentialRepeat: true })]).map((r) => r.studentId), ["s2"])
  assert.equal(P.promotionChanges(saved, saved).length, 0)
  assert.equal(P.promotionChanges(saved, [row({ promotedTo: "x" })]).length, 1)
  assert.equal(P.promotionChanges(saved, [row({ provisional: false })]).length, 1)
  assert.equal(P.promotionChanges([], [row()]).length, 1)
})
test("promotion rows from response", () => {
  const r = P.toPromotionRows({ students: [{ student_id: "s1", name: "A", promoted_to: null, is_essential_repeat: true }] })
  assert.deepEqual(r, [{ studentId: "s1", name: "A", promotedTo: "", essentialRepeat: true, provisional: false }])
  assert.deepEqual(P.toPromotionRows(null), [])
})

const subjects = [{ subject_id: "sub", name: "Math", exams: [{ id: "e", exam_name: "Unit", sub_exams: [{ id: "x", name: "U1", marks: { marks_obtain: "17" } }, { id: "y", name: "U2", marks: null }] }] }]
test("mark rows flatten with prefill", () => {
  assert.deepEqual(P.toMarkRows(subjects).map((r) => [r.subExamId, r.marks]), [["x", "17"], ["y", ""]])
  assert.deepEqual(P.toMarkRows(undefined), [])
})
test("transfer: only filled rows, section in query", () => {
  const r = P.buildTransfer("st", "sec", P.toMarkRows(subjects))
  assert.deepEqual(r.value, { body: { student_id: "st", transfer_marks: [{ subject_id: "sub", exam_id: "e", sub_exam_id: "x", marks: "17" }] }, params: { section_id: "sec" } })
})
test("transfer: validation", () => {
  const rows = P.toMarkRows(subjects)
  assert.match(P.buildTransfer("", "sec", rows).error, /Student/)
  assert.match(P.buildTransfer("st", "", rows).error, /section/)
  assert.match(P.buildTransfer("st", "sec", [{ ...rows[0], marks: "  " }]).error, /at least one/)
  assert.match(P.buildTransfer("st", "sec", [{ ...rows[0], marks: "1".repeat(21) }]).error, /20/)
  assert.equal(P.buildTransfer("st", "sec", [{ ...rows[0], marks: "1".repeat(20) }]).error, undefined)
})
test("section change: body and query split, must differ", () => {
  assert.deepEqual(P.buildSectionChange("st", "a", "b").value, { body: { student_id: "st", from_section_id: "a" }, params: { to_section_id: "b" } })
  assert.match(P.buildSectionChange("st", "a", "a").error, /differ/)
  assert.match(P.buildSectionChange("", "a", "b").error, /Student/)
  assert.match(P.buildSectionChange("st", "", "b").error, /sections/)
})

const cur = [{ subjectId: "sub", subject: "Math", examId: "e2", exam: "Unit", examShort: "U", subExamId: "cx", subExam: "U1", subShort: "u1", marks: "" }]
const prv = [
  { subjectId: "sub", subject: "Math", examId: "e1", exam: "Unit", examShort: "U", subExamId: "px", subExam: "U1", subShort: "u1", marks: "17" },
  { subjectId: "sub", subject: "Math", examId: "e1", exam: "Unit", examShort: "U", subExamId: "py", subExam: "U2", subShort: "u2", marks: "9" },
  { subjectId: "sub", subject: "Math", examId: "e1", exam: "Unit", examShort: "U", subExamId: "pz", subExam: "U3", subShort: "u3", marks: "" },
]
test("transfer rows use the CURRENT section's ids, prefilled from previous", () => {
  const m = P.matchToCurrent(prv, cur)
  assert.deepEqual([m[0].examId, m[0].subExamId, m[0].marks, !!m[0].missing], ["e2", "cx", "17", false])
  assert.equal(m[1].missing, true)
  const ok = P.buildTransfer("st", "sec", [m[0]])
  assert.deepEqual(ok.value.body.transfer_marks, [{ subject_id: "sub", exam_id: "e2", sub_exam_id: "cx", marks: "17" }])
})
test("transfer blocks an unmatched row with a mark, allows it once cleared", () => {
  const m = P.matchToCurrent(prv, cur)
  assert.match(P.buildTransfer("st", "sec", m).error, /No matching sub-exam.*U2/)
  assert.equal(P.buildTransfer("st", "sec", [m[0], { ...m[1], marks: "" }, m[2]]).error, undefined)
})

test("mergePromotion: edits per student over the fresh list; new students kept, removed dropped", () => {
  const fresh = [row(), row({ studentId: "new", promotedTo: "" })]
  const edited = [row({ promotedTo: "other" }), row({ studentId: "gone" })]
  const m = P.mergePromotion(fresh, edited)
  assert.deepEqual(m.map((r) => [r.studentId, r.promotedTo]), [["s1", "other"], ["new", ""]])
  assert.deepEqual(P.mergePromotion(fresh, null), fresh)
})
test("listChanged detects added/removed students only", () => {
  assert.equal(P.listChanged([row()], [row()]), false)
  assert.equal(P.listChanged([row()], [row(), row({ studentId: "n" })]), true)
  assert.equal(P.listChanged([row(), row({ studentId: "n" })], [row()]), true)
  assert.equal(P.listChanged([row()], [row({ studentId: "z" })]), true)
})
