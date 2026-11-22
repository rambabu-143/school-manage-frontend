import assert from "node:assert/strict"
import test from "node:test"

const E = await import("../src/lib/exam-settings.ts")

const gs = { yearId: "y", grade: " A1 ", gradeIds: ["g"], min: "90", max: "100", order: "1" }
test("grade setting: body shape and trimming", () => {
  assert.deepEqual(E.buildGradeSetting(gs).body, { academic_year_id: "y", grade: "A1", grade_ids: ["g"], min_marks: 90, max_marks: 100, order: 1 })
})
test("grade setting: validation", () => {
  assert.match(E.buildGradeSetting({ ...gs, min: "101" }).error, /exceed/)
  assert.equal(E.buildGradeSetting({ ...gs, min: "100", max: "100" }).error, undefined)
  assert.match(E.buildGradeSetting({ ...gs, min: "-1" }).error, /Min/)
  assert.match(E.buildGradeSetting({ ...gs, gradeIds: [] }).error, /class/)
  assert.match(E.buildGradeSetting({ ...gs, grade: "x".repeat(21) }).error, /20/)
  assert.match(E.buildGradeSetting({ ...gs, grade: " " }).error, /required/)
  assert.match(E.buildGradeSetting({ ...gs, order: "1.5" }).error, /whole/)
  assert.match(E.buildGradeSetting({ ...gs, max: "" }).error, /Max/)
  assert.match(E.buildGradeSetting({ ...gs, yearId: "" }).error, /year/)
})

const w = { yearId: "y", gradeId: "g", subjectId: "s", columnName: "Unit 1", shortName: "U1", formula: "avg", examIds: ["e"], weightage: "20", order: "2" }
test("weightage: create includes refs, update omits them", () => {
  assert.deepEqual(E.buildWeightageCreate(w).body, { academic_year_id: "y", grade_id: "g", subject_id: "s", column_name: "Unit 1", short_name: "U1", formula: "avg", exam_name_ids: ["e"], weightage: 20, order: 2 })
  assert.deepEqual(E.buildWeightageUpdate(w).body, { column_name: "Unit 1", short_name: "U1", formula: "avg", exam_name_ids: ["e"], weightage: 20, order: 2 })
})
test("weightage: validation, no sum rule", () => {
  assert.match(E.buildWeightageCreate({ ...w, subjectId: "" }).error, /subject/)
  assert.match(E.buildWeightageCreate({ ...w, columnName: "x".repeat(101) }).error, /100/)
  assert.match(E.buildWeightageCreate({ ...w, shortName: "x".repeat(51) }).error, /50/)
  assert.match(E.buildWeightageCreate({ ...w, formula: "" }).error, /Formula/)
  assert.match(E.buildWeightageCreate({ ...w, examIds: [] }).error, /exam/)
  assert.match(E.buildWeightageCreate({ ...w, weightage: "abc" }).error, /Weightage/)
  assert.equal(E.buildWeightageCreate({ ...w, weightage: "250" }).error, undefined)
  assert.equal(E.buildWeightageCreate({ ...w, weightage: "-5" }).error, undefined)
})

const b = { yearId: "y", gradeId: "g", subjectId: "s", columnName: "Term 1", columnFor: ["bluesheet"], term: "1", maxMarks: "100", formula: "", isConverted: false, convertedMarks: "", parts: [], addInTotal: true, addInTotalTerm1: false, order: "1" }
test("bluesheet: defaults and body shape", () => {
  assert.deepEqual(E.buildBluesheetCreate(b).body, {
    academic_year_id: "y", grade_id: "g", subject_id: "s", column_name: "Term 1", column_for: ["bluesheet"], term: "1", max_marks: 100, formula: "no_formula",
    is_converted: false, converted_marks: null, description: [], add_in_total: true, add_in_total_term1: false, order: 1,
  })
  assert.equal("academic_year_id" in E.buildBluesheetUpdate(b).body, false)
})
test("bluesheet: converted marks only when converting", () => {
  assert.match(E.buildBluesheetCreate({ ...b, isConverted: true }).error, /Converted/)
  assert.equal(E.buildBluesheetCreate({ ...b, isConverted: true, convertedMarks: "20" }).body.converted_marks, 20)
  assert.equal(E.buildBluesheetCreate({ ...b, isConverted: false, convertedMarks: "20" }).body.converted_marks, null)
})
test("bluesheet: parts validated and mapped", () => {
  const p = { examIds: ["e"], formula: "best", weightage: "10", comparePart: "" }
  assert.deepEqual(E.buildBluesheetCreate({ ...b, parts: [p] }).body.description, [{ exam_name_ids: ["e"], formula: "best", weightage: 10, compare_part: null }])
  assert.equal(E.buildBluesheetCreate({ ...b, parts: [{ ...p, comparePart: "5" }] }).body.description[0].compare_part, 5)
  assert.match(E.buildBluesheetCreate({ ...b, parts: [{ ...p, examIds: [] }] }).error, /Part 1/)
  assert.match(E.buildBluesheetCreate({ ...b, parts: [{ ...p, weightage: "" }] }).error, /weightage/)
  assert.match(E.buildBluesheetCreate({ ...b, parts: [{ ...p, formula: " " }] }).error, /formula/)
  assert.match(E.buildBluesheetCreate({ ...b, parts: [{ ...p, comparePart: "x" }] }).error, /compare/)
})
test("bluesheet: required fields", () => {
  assert.match(E.buildBluesheetCreate({ ...b, columnFor: [] }).error, /AR/)
  assert.match(E.buildBluesheetCreate({ ...b, term: " " }).error, /Term/)
  assert.match(E.buildBluesheetCreate({ ...b, maxMarks: "" }).error, /Max/)
  assert.match(E.buildBluesheetCreate({ ...b, columnName: "" }).error, /Column/)
  assert.match(E.buildBluesheetCreate({ ...b, gradeId: "" }).error, /class/)
})
