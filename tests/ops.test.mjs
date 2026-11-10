import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

import * as R from "../src/lib/ops/resources.ts"
import { buildPayload, fromIso, reportRows, toFormValues } from "../src/lib/ops/form.ts"

const spec = JSON.parse(fs.readFileSync("contracts/openapi.json", "utf8"))
const op = (method, path) => spec.paths[`/api/v1${path.replace(/\{id\}/g, "{__id}")}`]?.[method] ?? lookup(method, path)
function lookup(method, path) {
  const segs = path.split("/")
  for (const [p, ops] of Object.entries(spec.paths)) {
    const ps = p.replace("/api/v1", "").split("/")
    if (ps.length === segs.length && ps.every((s, i) => s === segs[i] || (s.startsWith("{") && (segs[i].startsWith("{") || true) && segs[i].startsWith("{")))) {
      if (ops[method]) return ops[method]
    }
  }
}
const props = (o) => {
  const c = o?.requestBody?.content
  let sc = c && Object.values(c)[0].schema
  if (sc?.$ref) sc = spec.components.schemas[sc.$ref.split("/").pop()]
  return { props: Object.keys(sc?.properties ?? {}), required: sc?.required ?? [] }
}
const queryNames = (o) => (o?.parameters ?? []).filter((p) => p.in === "query").map((p) => p.name)

test("every resource path+method exists and fields match the request schemas", () => {
  for (const r of Object.values(R.RESOURCES)) {
    assert.ok(op("get", r.list), `${r.key} list ${r.list}`)
    const names = queryNames(op("get", r.list))
    for (const f of r.filters ?? []) assert.ok(names.includes(f.name), `${r.key} filter ${f.name}`)
    if (r.scope) assert.ok(names.includes("branch_id") || r.create, `${r.key} scope`)
    const create = r.create ? props(op("post", r.create)) : null
    if (create) {
      for (const f of r.fields.filter((x) => !x.pathParam && !x.editOnly)) assert.ok(create.props.includes(f.name), `${r.key} create field ${f.name}`)
      for (const q of create.required) assert.ok(r.fields.some((f) => f.name === q), `${r.key} missing required ${q}`)
    }
    if (r.item && !r.noUpdate) {
      const put = props(op("put", r.item))
      for (const f of r.fields.filter((x) => !x.createOnly && !x.pathParam)) assert.ok(put.props.includes(f.name), `${r.key} update field ${f.name}`)
    }
    if (r.item && !r.noDelete) assert.ok(op("delete", r.item), `${r.key} delete`)
    for (const a of r.actions ?? []) assert.ok(op(a.method, a.path), `${r.key} action ${a.path}`)
    for (const d of r.downloads ?? []) assert.ok(op("get", d.path), `${r.key} download`)
  }
})

test("reports and action forms point at real operations with real fields", () => {
  for (const rep of [...R.INVENTORY_REPORTS, ...R.TRANSPORT_REPORTS, ...R.ID_CARD_REPORT, ...R.SHOOTING_CLASSWISE]) {
    const o = op(rep.method, rep.path)
    assert.ok(o, rep.path)
    const allowed = rep.method === "get" ? queryNames(o) : props(o).props
    for (const f of rep.fields.filter((x) => !x.pathParam)) assert.ok(allowed.includes(f.name), `${rep.key} ${f.name}`)
  }
  for (const c of [R.STOCK_IN, R.RENEWAL_NOTIFY, R.EVENT_MAIL, R.SYLLABUS_UPLOAD, R.NOMINATION_UPLOAD]) {
    const o = op(c.method, c.path)
    assert.ok(o, c.path)
    const p = props(o)
    for (const f of c.fields) assert.ok(p.props.includes(f.name), `${c.key} ${f.name}`)
    for (const q of p.required) assert.ok(c.fields.some((f) => f.name === q), `${c.key} missing required ${q}`)
  }
  for (const c of R.SECTION_CERTIFICATES) assert.ok(op("get", c.path), c.path)
})

test("buildPayload coerces, omits empties and reports missing required", () => {
  const fields = [
    { name: "n", label: "N", kind: "number", required: true },
    { name: "t", label: "T" },
    { name: "b", label: "B", kind: "bool" },
    { name: "e", label: "E", kind: "lines" },
    { name: "branch_id", label: "Branch", scoped: true, required: true },
    { name: "once", label: "O", createOnly: true },
  ]
  const ok = buildPayload(fields, { n: "3", t: "", b: true, e: "a@x.com\n b@x.com,", once: "x" }, { scope: { branch_id: "B1" } })
  assert.deepEqual(ok.body, { n: 3, b: true, e: ["a@x.com", "b@x.com"], branch_id: "B1", once: "x" })
  assert.deepEqual(ok.errors, {})
  const bad = buildPayload(fields, { n: "" }, { editing: true })
  assert.deepEqual(Object.keys(bad.errors).sort(), ["branch_id", "n"])
  assert.equal("once" in buildPayload(fields, { n: 1, once: "x" }, { editing: true, scope: { branch_id: "B" } }).body, false)
})

test("form value helpers", () => {
  assert.equal(toFormValues([{ name: "t", label: "t", kind: "time" }], { t: "09:30:00" }).t, "09:30")
  assert.equal(fromIso("not a date"), "")
  assert.deepEqual(reportRows([{ a: 1, transactions: [{ q: 1 }, { q: 2 }] }], "transactions"), [{ a: 1, q: 1 }, { a: 1, q: 2 }])
  assert.deepEqual(reportRows(null), [])
})
