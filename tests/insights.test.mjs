import assert from "node:assert/strict"
import test from "node:test"

import { defaultRange, favouriteItems, presentPct, validRange } from "../src/lib/insights.ts"

test("defaultRange is the last N days ending today", () => {
  assert.deepEqual(defaultRange(new Date("2026-03-31T10:00:00Z")), { start: "2026-03-01", end: "2026-03-31" })
  assert.deepEqual(defaultRange(new Date("2026-01-05T00:00:00Z"), 7), { start: "2025-12-29", end: "2026-01-05" })
})

test("validRange rejects inverted and malformed ranges", () => {
  assert.equal(validRange("2026-01-01", "2026-01-01"), true)
  assert.equal(validRange("2026-02-01", "2026-01-01"), false)
  assert.equal(validRange("", "2026-01-01"), false)
  assert.equal(validRange("2026-1-1", "2026-01-02"), false)
})

test("favouriteItems keeps only visible items and ignores stale keys", () => {
  const items = [{ href: "/students" }, { href: "/staff" }]
  assert.deepEqual(favouriteItems(items, ["/staff", "/gone"]), [{ href: "/staff" }])
  assert.deepEqual(favouriteItems(items, undefined), [])
})

test("presentPct handles zero marked", () => {
  assert.equal(presentPct(0, 0), 0)
  assert.equal(presentPct(1, 3), 33)
  assert.equal(presentPct(3, 3), 100)
})
