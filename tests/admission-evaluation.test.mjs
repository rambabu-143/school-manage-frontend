import assert from "node:assert/strict"
import test from "node:test"

const E = await import("../src/lib/admission-evaluation.ts")

test("parseMarks: blank, decimals, range", () => {
  assert.equal(E.parseMarks("  ", 50), null)
  assert.deepEqual(E.parseMarks("12.5", 50), { value: 12.5 })
  assert.deepEqual(E.parseMarks("50", 50), { value: 50 })
  assert.ok("error" in E.parseMarks("50.01", 50))
  assert.ok("error" in E.parseMarks("-1", 50))
  assert.ok("error" in E.parseMarks("1.234", 50))
  assert.ok("error" in E.parseMarks("abc", 50))
  assert.ok("error" in E.parseMarks("1e2", 500))
})

test("merge keeps other subjects and totals them", () => {
  const rows = [{ id: "r1", marks_details: [{ subject_id: "eng", marks: 10 }] }]
  const { payload, errors } = E.buildMarksPayload({ rows, drafts: { r1: "7.5" }, subjectId: "math", maxMarks: 20, reappear: false })
  assert.deepEqual(errors, {})
  assert.deepEqual(payload, [{ id: "r1", marks: 17.5, marks_details: [{ subject_id: "eng", marks: 10 }, { subject_id: "math", marks: 7.5, max_marks: 20 }] }])
})

test("overwrite counted, unchanged and blank skipped, errors per row", () => {
  const rows = [
    { id: "a", marks_details: [{ subject_id: "s", marks: 5 }] },
    { id: "b", marks_details: [{ subject_id: "s", marks: 6 }] },
    { id: "c" },
    { id: "d" },
  ]
  const r = E.buildMarksPayload({ rows, drafts: { a: "9", b: "6", c: "", d: "99" }, subjectId: "s", maxMarks: 10, reappear: false })
  assert.equal(r.payload.length, 1)
  assert.equal(r.payload[0].id, "a")
  assert.equal(r.overwrites, 1)
  assert.deepEqual(Object.keys(r.errors), ["d"])
})

test("reappear payload has no total and preserves entry extras", () => {
  const rows = [{ id: "r", reappear_marks_details: [{ subject_id: "s", marks: 1, note: "x" }] }]
  const { payload } = E.buildMarksPayload({ rows, drafts: { r: "2" }, subjectId: "s", maxMarks: 5, reappear: true })
  assert.deepEqual(payload, [{ id: "r", reappear_marks_details: [{ subject_id: "s", marks: 2, note: "x", max_marks: 5 }] }])
})

test("attendance and allocate bodies", () => {
  assert.equal(E.buildAttendanceBody({ phase: 1, attendance: "LATE", className: "VI", roomId: "x" }), null)
  assert.equal(E.buildAttendanceBody({ phase: 0, attendance: "PRESENT", className: "VI", roomId: "x" }), null)
  assert.deepEqual(E.buildAttendanceBody({ phase: 2, attendance: "ABSENT", className: "VI", roomId: "x" }), {
    attendance_details: { phase: 2, attendance: "ABSENT" }, class: "VI", phase: 2, room_id: "x",
  })
  assert.equal(E.buildAllocateBody(undefined, 1), null)
  assert.deepEqual(E.buildAllocateBody("r", 1), { room_id: "r", phase: 1 })
})

test("current room/attendance by phase (string or number)", () => {
  const row = { id: "r", room_details: [{ phase: 1, room_id: "a" }, { phase: "2", room_id: "b" }], attendance_details: [{ phase: 2, attendance: "PRESENT" }] }
  assert.equal(E.currentRoom(row, 2), "b")
  assert.equal(E.currentRoom(row, 3), undefined)
  assert.equal(E.currentAttendance(row, 2), "PRESENT")
})

test("total rounds float noise and keeps 2 decimals", () => {
  assert.equal(E.totalMarks([{ marks: 0.1 }, { marks: 0.2 }]), 0.3)
  assert.equal(E.totalMarks([{ marks: 1.005 }, { marks: 2.004 }]), 3.01)
  assert.equal(E.totalMarks([{ marks: "x" }, { marks: 2 }]), 2)
})

test("merge replaces in place and keeps order, adds phase/max_marks", () => {
  const ex = [{ subject_id: "a", marks: 1 }, { subject_id: "b", marks: 2 }, { subject_id: "c", marks: 3 }]
  assert.deepEqual(E.mergeEntries(ex, "b", 9, { max_marks: 10 }).map((e) => [e.subject_id, e.marks]), [["a", 1], ["b", 9], ["c", 3]])
  assert.equal(E.mergeEntries(ex, "b", 9, { max_marks: 10 })[1].max_marks, 10)
})

test("failedDrafts keeps only rows whose saved marks differ from the draft", () => {
  const rows = [{ id: "a", marks_details: [{ subject_id: "s", marks: 5 }] }, { id: "b", marks_details: [] }, { id: "c" }]
  const r = E.failedDrafts({ rows, drafts: { a: "5", b: "4", c: "3" }, sentIds: ["a", "b", "c"], subjectId: "s", reappear: false })
  assert.deepEqual(Object.keys(r.drafts), ["b", "c"])
  assert.deepEqual(Object.keys(r.errors), ["b", "c"])
})

test("failedDrafts keeps a draft that differs from saved marks", () => {
  const rows = [{ id: "a", marks_details: [{ subject_id: "s", marks: 5 }] }]
  const r = E.failedDrafts({ rows, drafts: { a: "4" }, sentIds: ["a"], subjectId: "s", reappear: false })
  assert.deepEqual(r.drafts, { a: "4" })
})

test("decideSave: block on error/empty, reconfirm on change, else save", () => {
  assert.equal(E.decideSave({ isError: true, data: [1] }, [1], [1]), "block")
  assert.equal(E.decideSave({ isError: false, data: undefined }, [1], [1]), "block")
  assert.equal(E.decideSave({ isError: false, data: [1] }, [1], [2]), "reconfirm")
  assert.equal(E.decideSave({ isError: false, data: [1] }, [1], [1]), "save")
})
