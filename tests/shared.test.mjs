import assert from "node:assert/strict"
import test from "node:test"

const { parseApiError, parseRetryAfter } = await import("../src/lib/shared/api-error.ts")
const { validateFile, CSV_RULE, IMAGE_RULE } = await import("../src/lib/shared/file-validation.ts")
const { parseListParams, patchSearch, normalizeDateRange, toApiParams } = await import("../src/lib/shared/url-params.ts")
const { filenameFromDisposition } = await import("../src/lib/shared/download.ts")

const err = (status, data, headers) => ({ response: { status, data, headers } })

test("api-error: statuses map to kinds and messages", () => {
  assert.equal(parseApiError(err(401, {})).kind, "auth")
  assert.equal(parseApiError(err(403, { detail: "Forbidden role" })).message, "Forbidden role")
  assert.equal(parseApiError(err(404, {})).kind, "not_found")
  assert.equal(parseApiError(err(409, { detail: "Name exists" })).message, "Name exists")
  assert.equal(parseApiError(err(503, { detail: "Email is not configured" })).message, "Email is not configured")
  assert.equal(parseApiError(err(500, { detail: "Traceback..." })).message.includes("Traceback"), false)
  assert.equal(parseApiError(new Error("x")).kind, "network")
})

test("api-error: 422 field errors, both backend shapes", () => {
  const a = parseApiError(err(422, { message: "Request validation failed", details: { field_errors: [{ field: "name", message: "too short" }] } }))
  assert.deepEqual(a.fieldErrors, { name: "too short" })
  const b = parseApiError(err(422, { detail: [{ loc: ["body", "address", "city"], msg: "required" }] }))
  assert.deepEqual(b.fieldErrors, { "address.city": "required" })
})

test("api-error: bulk-import row errors", () => {
  const e = parseApiError(err(422, { detail: { message: "Import rejected; nothing was changed", error_count: 2, errors: [{ row: 3, message: "bad" }, { row: 5, message: "dup" }, { nope: 1 }] } }))
  assert.equal(e.message, "Import rejected; nothing was changed")
  assert.deepEqual(e.rowErrors, [{ row: 3, message: "bad" }, { row: 5, message: "dup" }])
})

test("api-error: 429 Retry-After", () => {
  assert.equal(parseApiError(err(429, {}, { "retry-after": "30" })).retryAfter, 30)
  assert.equal(parseApiError(err(429, {}, { get: (n) => (n === "retry-after" ? "7" : null) })).message, "Too many requests. Try again in 7s.")
  assert.equal(parseApiError(err(429, {}, {})).retryAfter, null)
  assert.equal(parseRetryAfter("Thu, 01 Jan 1970 00:01:00 GMT", 0), 60)
  assert.equal(parseRetryAfter("junk"), null)
})

test("file validation", () => {
  const csv = (o) => ({ name: "a.csv", size: 100, type: "text/csv", ...o })
  assert.equal(validateFile(csv({}), CSV_RULE), null)
  assert.match(validateFile(csv({ size: 10 * 1024 * 1024 + 1 }), CSV_RULE), /larger than 10 MB/)
  assert.match(validateFile(csv({ size: 0 }), CSV_RULE), /empty/)
  assert.match(validateFile(csv({ name: "a.exe" }), CSV_RULE), /unsupported/)
  assert.equal(validateFile({ name: "p.PNG", size: 5, type: "image/png" }, IMAGE_RULE), null)
  assert.match(validateFile({ name: "p.gif", size: 5, type: "image/gif" }, IMAGE_RULE), /unsupported/)
})

test("url params: bounds, defaults, patching", () => {
  const p = (q) => parseListParams(new URLSearchParams(q))
  assert.deepEqual(p(""), { page: 1, limit: 20, sort: null, dir: "asc" })
  assert.equal(p("limit=5000").limit, 100)
  assert.equal(p("limit=-3&page=0").limit, 20)
  assert.equal(p("page=abc").page, 1)
  assert.equal(p("dir=desc&sort=name").dir, "desc")
  const q = patchSearch(new URLSearchParams("page=4&x=1"), { limit: 50, x: null })
  assert.equal(q, "limit=50")
  assert.equal(patchSearch(new URLSearchParams("page=4"), { page: 5 }), "page=5")
  assert.deepEqual(toApiParams({ page: 3, limit: 20, sort: "name", dir: "desc" }, { branch_id: "b", empty: "" }), { offset: 40, limit: 20, sort: "-name", branch_id: "b" })
})

test("date range normalisation", () => {
  assert.deepEqual(normalizeDateRange("2025-05-02", "2025-05-01"), { from: "2025-05-01", to: "2025-05-02" })
  assert.deepEqual(normalizeDateRange("garbage", "2025-05-01"), { from: null, to: "2025-05-01" })
})

test("content-disposition filename", () => {
  assert.equal(filenameFromDisposition('attachment; filename="card.pdf"'), "card.pdf")
  assert.equal(filenameFromDisposition("attachment; filename*=UTF-8''r%C3%A9sum%C3%A9.pdf"), "résumé.pdf")
  assert.equal(filenameFromDisposition('attachment; filename="../../etc/passwd"'), "passwd")
  assert.equal(filenameFromDisposition(undefined), null)
})
