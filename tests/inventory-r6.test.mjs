import assert from "node:assert/strict"
import test from "node:test"

import { validateChain } from "../src/lib/approver-chain.ts"
import { parentError } from "../src/lib/master-data.ts"
import { MAX_PO_ITEMS, buildPoPayload, itemsTotal, validatePo } from "../src/lib/purchase-orders.ts"
import { buildRoomPayload, missingRoomFields } from "../src/lib/rooms.ts"

test("reception needs floor/area/facing/capacity/block; other needs none", () => {
  assert.deepEqual(missingRoomFields("reception", {}), ["floor", "area", "facing", "capacity", "block"])
  assert.deepEqual(missingRoomFields("reception", { floor: "1", area: "a", facing: "N", capacity: 3, block_id: "b" }), [])
  assert.deepEqual(missingRoomFields("lab", { floor: "1", area: "a", facing: "N", capacity: 3, block: "A" }), [])
  assert.deepEqual(missingRoomFields("other", {}), [])
})

test("room payload drops empty optionals", () => {
  assert.deepEqual(buildRoomPayload({ floor: "", block: "", block_id: "x", area: "", capacity: undefined }), { block_id: "x" })
})

test("state needs a country parent", () => {
  assert.match(parentError("state", ""), /country/)
  assert.equal(parentError("state", "id"), null)
  assert.equal(parentError("city", ""), null)
})

test("PO amount optional only with priced items", () => {
  const it = { product_id: "p", quantity: 2, rate: 5 }
  assert.equal(itemsTotal([it, { ...it, quantity: 1, rate: 0.5 }]), 10.5)
  assert.equal(validatePo(undefined, [it]), null)
  assert.ok(validatePo(undefined, []))
  assert.ok(validatePo(undefined, [{ ...it, rate: 0 }]))
  assert.equal(validatePo(10, []), null)
  assert.ok(validatePo(10, [{ ...it, product_id: "" }]))
  assert.ok(validatePo(10, Array(MAX_PO_ITEMS + 1).fill(it)))
})

test("PO item bounds: cap is exactly 200, qty int > 0, rate >= 0 with 2 decimals", () => {
  const it = { product_id: "p", quantity: 1, rate: 1 }
  assert.equal(validatePo(undefined, Array(MAX_PO_ITEMS).fill(it)), null)
  assert.ok(validatePo(10, [{ ...it, quantity: 0 }]))
  assert.ok(validatePo(10, [{ ...it, quantity: 1.5 }]))
  assert.ok(validatePo(10, [{ ...it, rate: -1 }]))
  assert.ok(validatePo(10, [{ ...it, rate: 1.234 }]))
  assert.equal(validatePo(10, [{ ...it, rate: 1.25 }]), null)
  assert.equal(validatePo(10, [{ ...it, rate: 0 }]), null)
})

test("PO payload omits amount/items when blank", () => {
  const it = { product_id: "p", quantity: 1, rate: 2 }
  assert.deepEqual(buildPoPayload({ d: 1, amount: undefined }, [it]), { d: 1, items: [it] })
  assert.deepEqual(buildPoPayload({ d: 1, amount: 9 }, []), { d: 1, amount: 9 })
})

test("approver chain validation", () => {
  assert.equal(validateChain("r", ["a", "b"]), null)
  assert.ok(validateChain("", ["a"]))
  assert.ok(validateChain("r", []))
  assert.ok(validateChain("r", ["r"]))
  assert.ok(validateChain("r", ["a", "a"]))
  assert.ok(validateChain("r", ["a", ""]))
})
