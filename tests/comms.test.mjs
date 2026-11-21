import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

import * as C from "../src/lib/comms.ts"

const spec = JSON.parse(fs.readFileSync("contracts/openapi.json", "utf8"))
const schemaProps = (n) => Object.keys(spec.components.schemas[n].properties)

test("resolveBranch prefers an explicit pick, falls back to the session branch", () => {
  assert.equal(C.resolveBranch("b1", "b2"), "b1")
  assert.equal(C.resolveBranch("", "b2"), "b2")
  assert.equal(C.resolveBranch(undefined, null), undefined)
})

test("noticeSearchBody drops empties, rejects inverted ranges, matches NoticeSearch", () => {
  const ok = C.noticeSearchBody({ audience: "staff", start_date: "2026-01-01", end_date: "" })
  assert.deepEqual(ok.body, { audience: "staff", start_date: "2026-01-01" })
  assert.equal(ok.error, undefined)
  assert.ok(C.noticeSearchBody({ start_date: "2026-02-01", end_date: "2026-01-01" }).error)
  assert.deepEqual(C.noticeSearchBody({ audience: "" }).body, {})
  for (const k of Object.keys(C.noticeSearchBody({ branch_id: "b", audience: "all", start_date: "a", end_date: "b" }).body))
    assert.ok(schemaProps("NoticeSearch").includes(k), k)
})

test("noticeUpdateBody clears blank optionals and only uses NoticeUpdate fields", () => {
  const b = C.noticeUpdateBody({ title: "t", body: "b", audience: "all", start_date: "2026-01-01", end_date: "2026-01-02", color_code: "", location: "" })
  assert.equal(b.color_code, null)
  assert.equal(b.location, null)
  for (const k of Object.keys(b)) assert.ok(schemaProps("NoticeUpdate").includes(k), k)
})

test("groupCreateBody sends branch only when known and matches NoticeGroupCreate", () => {
  const v = { name: " A ", student_ids: ["s"], staff_ids: [] }
  assert.equal(C.groupCreateBody(v).branch_id, undefined)
  const b = C.groupCreateBody(v, "br")
  assert.equal(b.branch_id, "br")
  assert.equal(b.name, "A")
  for (const k of Object.keys(b)) assert.ok(schemaProps("NoticeGroupCreate").includes(k), k)
})

test("ownStaffId finds the staff row linked to the user", () => {
  const staff = [{ id: "s1", user_id: null }, { id: "s2", user_id: "u" }]
  assert.equal(C.ownStaffId(staff, "u"), "s2")
  assert.equal(C.ownStaffId(staff, "x"), undefined)
  assert.equal(C.ownStaffId(undefined, "u"), undefined)
  assert.equal(C.ownStaffId(staff, undefined), undefined)
})

test("sms helpers hit real operations", () => {
  const p = C.smsReadPath("student", "m", "p")
  assert.equal(p, "/sms/read/student/SMS/m/p")
  assert.ok(spec.paths["/api/v1/sms/read/student/{type}/{message_id}/{student_id}"].put)
  assert.ok(spec.paths["/api/v1/sms/read/staff/{type}/{message_id}/{staff_id}"].put)
  assert.deepEqual(schemaProps("SmsReadUpdate"), ["read_flag"])
  assert.equal(C.unreadLabel(0), "")
  assert.equal(C.unreadLabel(3), "3")
  assert.equal(C.unreadLabel(42), "9+")
  assert.ok(C.SMS_SENDER_ROLES.includes("teacher") && !C.SMS_SENDER_ROLES.includes("parent"))
  assert.ok(C.GROUP_ROLES.includes("teacher") && !C.GROUP_ROLES.includes("accountant"))
})

test("datesheetChanges sends only changed fields and rejects end <= start", () => {
  const o = { subject_id: "a", exam_date: "2026-01-01", start_time: "09:00:00", end_time: "11:00:00" }
  const same = C.datesheetChanges(o, { ...o, start_time: "09:00", end_time: "11:00" })
  assert.deepEqual(same.body, {})
  const ch = C.datesheetChanges(o, { ...o, subject_id: "b", end_time: "12:00" })
  assert.deepEqual(ch.body, { subject_id: "b", end_time: "12:00" })
  assert.ok(C.datesheetChanges(o, { ...o, end_time: "09:00" }).error)
  for (const k of Object.keys(ch.body)) assert.ok(schemaProps("DatesheetEntryUpdate").includes(k), k)
})
