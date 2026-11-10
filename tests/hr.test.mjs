import assert from "node:assert/strict"
import test from "node:test"

const { humanize, cellText, columnKeys, toggleId, isCountsOnly, sectionProgress, balanceEntries, invalidBalanceKeys, validRange, parseJsonObject } =
  await import("../src/lib/hr/rows.ts")

test("humanize / cellText", () => {
  assert.equal(humanize("leave_type"), "Leave type")
  assert.equal(cellText(null), "-")
  assert.equal(cellText(false), "No")
  assert.equal(cellText({ a: 1 }), '{"a":1}')
  assert.equal(cellText(0), "0")
})

test("columnKeys: union, ids last, capped", () => {
  assert.deepEqual(columnKeys([{ id: 1, name: "a" }, { name: "b", x: 2 }]), ["name", "x", "id"])
  assert.equal(columnKeys([Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`k${i}`, i]))]).length, 10)
})

test("toggleId is immutable", () => {
  const a = ["x"]
  assert.deepEqual(toggleId(a, "y"), ["x", "y"])
  assert.deepEqual(toggleId(a, "x"), [])
  assert.deepEqual(a, ["x"])
})

test("AAR anonymity: counts-only detection", () => {
  const counts = [{ section_id: "s", total_students: 3, rated: 2, final_submitted: 1 }]
  assert.equal(isCountsOnly(counts), true)
  assert.equal(isCountsOnly([{ student_id: "a", name: "n" }]), false)
  assert.equal(isCountsOnly([]), false)
  assert.equal(sectionProgress(counts[0]), "2/3 rated, 1 final")
})

test("balanceEntries drops invalid cells", () => {
  const good = { carry_forward: "1", credit_in_jan: "2.5", credit_in_july: "0" }
  const out = balanceEntries({ "s1:t1": good, "s2:t1": { ...good, credit_in_jan: "" }, "s3:t1": { ...good, carry_forward: "-1" } })
  assert.equal(out.length, 1)
  assert.equal(out[0].staff_id, "s1")
})

test("validRange", () => {
  assert.equal(validRange("2026-01-01", "2026-01-01"), true)
  assert.equal(validRange("2026-02-01", "2026-01-01"), false)
  assert.equal(validRange("", "2026-01-01"), false)
})

test("parseJsonObject", () => {
  assert.equal(parseJsonObject("  "), null)
  assert.deepEqual(parseJsonObject('{"a":1}'), { a: 1 })
  assert.throws(() => parseJsonObject("[1]"))
  assert.throws(() => parseJsonObject("{bad"))
})

test("invalidBalanceKeys lists cells balanceEntries drops", () => {
  const good = { carry_forward: "1", credit_in_jan: "2", credit_in_july: "3" }
  assert.deepEqual(invalidBalanceKeys({ "s1:t1": good, "s2:t1": { ...good, credit_in_jan: "" }, "s3:t1": { ...good, carry_forward: "-1" } }), ["s2:t1", "s3:t1"])
})
