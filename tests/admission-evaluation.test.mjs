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
  assert.deepEqual(payload, [{ id: "r1", marks: 17.5, marks_details: [{ subject_id: "eng", marks: 10 }, { subject_id: "math", marks: 7.5 }] }])
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
  assert.deepEqual(payload, [{ id: "r", reappear_marks_details: [{ subject_id: "s", marks: 2, note: "x" }] }])
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
