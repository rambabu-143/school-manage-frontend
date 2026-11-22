import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

import { ADMISSION_OPS, buildAdmRequest, buildSendPayload } from "../src/lib/admission.ts"

const spec = JSON.parse(fs.readFileSync("contracts/openapi.json", "utf8"))
function find(method, path) {
  const segs = path.split("/")
  for (const [p, ops] of Object.entries(spec.paths)) {
    const ps = p.replace("/api/v1", "").split("/")
    if (ps.length === segs.length && ps.every((s, i) => s === segs[i] || (s.startsWith("{") && segs[i].startsWith("{"))) && ops[method]) return ops[method]
  }
}
const bodyProps = (o) => {
  let sc = Object.values(o.requestBody?.content ?? {})[0]?.schema
  if (sc?.$ref) sc = spec.components.schemas[sc.$ref.split("/").pop()]
  return { props: Object.keys(sc?.properties ?? {}), required: sc?.required ?? [], type: sc?.type }
}
const queryNames = (o) => (o.parameters ?? []).filter((p) => p.in === "query").map((p) => p.name)

test("every admission op exists with matching params, body and scope", () => {
  for (const op of ADMISSION_OPS) {
    const o = find(op.method, op.path)
    assert.ok(o, `${op.key} ${op.method} ${op.path}`)
    const q = queryNames(o)
    if (op.ctx === "both") assert.ok(q.includes("branch_id") && q.includes("academic_year_id"), `${op.key} ctx both`)
    if (op.ctx === "year") assert.ok(q.includes("academic_year_id") && !q.includes("branch_id"), `${op.key} ctx year`)
    if (op.ctx === "none") assert.ok(!q.includes("branch_id"), `${op.key} ctx none`)
    const fields = op.fields.filter((f) => !f.pathParam)
    if (op.method === "get" || op.method === "delete") {
      assert.ok(!o.requestBody, op.key)
      for (const f of fields) assert.ok(q.includes(f.name), `${op.key} query ${f.name}`)
    } else if (op.bodyList) {
      assert.equal(bodyProps(o).type, "array", `${op.key} array body`)
    } else if (!op.multipart) {
      const b = bodyProps(o)
      for (const f of fields) assert.ok(b.props.includes(f.name), `${op.key} body ${f.name}`)
      for (const r of b.required) assert.ok(fields.some((f) => f.name === r), `${op.key} missing required ${r}`)
    }
    const pathNames = [...op.path.matchAll(/\{(\w+)\}/g)].map((m) => m[1])
    assert.deepEqual(op.fields.filter((f) => f.pathParam).map((f) => f.name).sort(), pathNames.sort(), `${op.key} path params`)
  }
})

test("writes confirm; delete is admin-only", () => {
  for (const op of ADMISSION_OPS.filter((o) => o.method === "put" || o.method === "delete" || o.multipart)) assert.ok(op.confirm, op.key)
  assert.ok(ADMISSION_OPS.find((o) => o.key === "reg-delete").roles.length > 0)
})

const scope = { branch_id: "B1", academic_year_id: "Y1" }
const op = (k) => ADMISSION_OPS.find((o) => o.key === k)

test("buildAdmRequest: scope in query, path encoded, body split", () => {
  const r = buildAdmRequest(op("rep-attendance"), { class: "NURSERY", phase: "2" }, scope).req
  assert.deepEqual(r, { method: "post", url: "/admission/report/attendance-report", params: { branch_id: "B1", academic_year_id: "Y1" }, data: { class: "NURSERY", phase: 2 } })
  const g = buildAdmRequest(op("rep-all-registered"), { class_name: "Class X/1" }, scope).req
  assert.equal(g.url, "/admission/report/all-registered/Class%20X%2F1")
  assert.deepEqual(g.params, { branch_id: "B1", academic_year_id: "Y1" })
  assert.deepEqual(buildAdmRequest(op("reg-by-class"), { class_name: "A", branch_code: "22" }, scope).req.params, { branch_id: "B1", academic_year_id: "Y1", branch_code: 22 })
})

test("buildAdmRequest: array body, year-only scope, no scope params", () => {
  const d = buildAdmRequest(op("rep-dashboard"), { classes: "NURSERY\nPREP" }, scope).req
  assert.deepEqual(d.data, ["NURSERY", "PREP"])
  const m = buildAdmRequest(op("rep-master-dashboard"), { classes: "I" }, { branch_id: "B1", academic_year_id: "Y1" }).req
  assert.deepEqual(m.params, { academic_year_id: "Y1" })
  const u = buildAdmRequest(op("reg-update"), { reg_id: "R1", status: "ok" }, {}).req
  assert.deepEqual(u, { method: "put", url: "/admission/online-registration/R1", params: {}, data: { status: "ok" } })
})

test("buildAdmRequest: missing scope, path and required fields are errors", () => {
  const e = buildAdmRequest(op("rep-attendance"), {}, {}).errors
  assert.deepEqual(Object.keys(e).sort(), ["academic_year_id", "branch_id", "class", "phase"])
  assert.ok(buildAdmRequest(op("reg-delete"), { reg_id: "  " }, {}).errors.reg_id)
  assert.ok(buildAdmRequest(op("tally-csv"), {}, scope).errors.file)
})

test("buildSendPayload sends ids only and validates", () => {
  const rows = [{ id: "a", mobileno: "99999", personal_details: { x: 1 } }, { id: "" }, { mobileno: "1" }]
  const ok = buildSendPayload("Email", " hi ", " Sub ", rows).body
  assert.deepEqual(ok, { type: "Email", text: "hi", subject: "Sub", students: [{ registration_id: "a", mobileno: "99999" }] })
  assert.equal("subject" in buildSendPayload("SMS", "hi", "s", rows).body, false)
  assert.equal(buildSendPayload("SMS", "  ", "", rows).error, "Message is required")
  assert.equal(buildSendPayload("SMS", "hi", "", []).error, "No recipients")
})
