import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import { QueryClient } from "@tanstack/react-query"

import { stripTokenKeys, isSameOriginRequest, validateProxyPath, buildUpstreamHeaders, buildResponseHeaders, sanitizeErrorBody, readBodyLimited } from "../src/lib/bff-guards.ts"
import { safeNext } from "../src/lib/safe-redirect.ts"
import { singleFlight, _resetSingleFlight, forgetSingleFlight, refreshTokenKey } from "../src/lib/single-flight.ts"
import { qk, scopeKey, setQueryScope, subscribeQueryScope, getScopeKey } from "../src/lib/query-keys.ts"
import { staleTimeFor, shouldRetry, pollInterval } from "../src/lib/query-policy.ts"
import { createIdentityGuard, attachIdentityGuard, ctxToScopeCtx, nextSessionContext } from "../src/lib/identity-lifecycle.ts"
import { domainsToInvalidate } from "../src/lib/invalidation.ts"

const H = (o) => new Headers(o)

test("CSRF: mutating needs same Origin; safe methods pass", () => {
  assert.equal(isSameOriginRequest("GET", H({})), true)
  assert.equal(isSameOriginRequest("POST", H({ host: "a.com", origin: "https://a.com" })), true)
  assert.equal(isSameOriginRequest("POST", H({ host: "a.com", origin: "https://evil.com" })), false)
  assert.equal(isSameOriginRequest("POST", H({ host: "a.com", origin: "null" })), false)
  assert.equal(isSameOriginRequest("DELETE", H({ host: "a.com" })), false)
  assert.equal(isSameOriginRequest("PATCH", H({ host: "a.com", "sec-fetch-site": "cross-site" })), false)
  assert.equal(isSameOriginRequest("PUT", H({ host: "a.com", "sec-fetch-site": "same-origin" })), true)
  assert.equal(isSameOriginRequest("POST", H({ host: "int:3000", "x-forwarded-host": "a.com", origin: "https://a.com" })), true)
})

test("path guard: traversal, encoded separators, denied prefixes", () => {
  assert.equal(validateProxyPath(["students", "1"]), "/students/1")
  for (const bad of [[], [".."], ["a", ".."], ["."], ["a/b"], ["a\\b"], ["a\0"], ["%2e%2e"], ["a b"], [""]])
    assert.equal(validateProxyPath(bad), null, JSON.stringify(bad))
  assert.equal(validateProxyPath(["auth", "login"]), null)
  assert.equal(validateProxyPath(["Auth", "refresh"]), null)
  assert.equal(validateProxyPath(["openapi.json"]), null)
  assert.equal(validateProxyPath(["auth", "me"]), "/auth/me")
})

test("header allow-lists", () => {
  const up = buildUpstreamHeaders(H({ cookie: "access_token=x", host: "a", authorization: "Bearer y", "x-forwarded-for": "1", accept: "application/json", "content-type": "text/html" }), true)
  assert.equal(up.get("cookie"), null)
  assert.equal(up.get("host"), null)
  assert.equal(up.get("authorization"), null)
  assert.equal(up.get("x-forwarded-for"), null)
  assert.equal(up.get("content-type"), "application/json")
  assert.match(buildUpstreamHeaders(H({ "content-type": "multipart/form-data; boundary=z" }), true).get("content-type"), /boundary=z/)
  const down = buildResponseHeaders(H({ "set-cookie": "a=b", etag: '"1"', "retry-after": "5", "content-disposition": "attachment; filename=a.pdf", "x-powered-by": "x", "cache-control": "public" }))
  assert.equal(down.get("set-cookie"), null)
  assert.equal(down.get("x-powered-by"), null)
  assert.equal(down.get("etag"), '"1"')
  assert.equal(down.get("retry-after"), "5")
  assert.equal(down.get("content-disposition"), "attachment; filename=a.pdf")
  assert.equal(down.get("cache-control"), "private, no-store")
})

test("error body sanitization and body size limit", async () => {
  assert.equal(sanitizeErrorBody(422), null)
  assert.match(sanitizeErrorBody(500), /Upstream service error/)
  const mk = (n, h = {}) => new Request("http://t/", { method: "POST", body: new Uint8Array(n), headers: h })
  assert.equal((await readBodyLimited(mk(10), 20)).byteLength, 10)
  assert.equal(await readBodyLimited(mk(30), 20), null)
  assert.equal(await readBodyLimited(mk(1, { "content-length": "999" }), 20), null)
})

test("open redirect: next param", () => {
  assert.equal(safeNext("/students?x=1"), "/students?x=1")
  for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "/a\nb", "", null, "evil"])
    assert.equal(safeNext(bad), "/dashboard", String(bad))
})

test("refresh single-flight shares one call", async () => {
  let calls = 0
  const f = () => new Promise((r) => setTimeout(() => r(++calls), 10))
  const [a, b] = await Promise.all([singleFlight("t", f), singleFlight("t", f)])
  assert.equal(a, b)
  assert.equal(calls, 1)
  await singleFlight("t", f)
  assert.equal(calls, 2)
})

test("query keys are identity scoped", () => {
  setQueryScope({ userId: "u1", tenantId: "t1", branchId: "b1" })
  assert.deepEqual(qk("students", { p: 1 }), ["t1|u1|b1|-", "students", { p: 1 }])
  setQueryScope(null)
  assert.equal(qk("students")[0], "anon")
})

test("freshness policy and retry", () => {
  assert.equal(staleTimeFor("branches"), 300_000)
  assert.equal(staleTimeFor("students"), 30_000)
  assert.equal(staleTimeFor("dashboard-summary"), 20_000)
  assert.equal(staleTimeFor("student-attendance"), 5_000)
  for (const status of [401, 403, 404, 422]) assert.equal(shouldRetry(0, { response: { status } }), false)
  assert.equal(shouldRetry(0, { response: { status: 500 } }), true)
  assert.equal(shouldRetry(1, { response: { status: 500 } }), false)
  assert.equal(pollInterval(60_000, 0, true), false)
  assert.equal(pollInterval(60_000, 2, false), 240_000)
  assert.equal(pollInterval(60_000, 9, false), 480_000)
})

test("identity lifecycle purges other scopes, keeps session", () => {
  const client = new QueryClient()
  const guard = createIdentityGuard(client)
  const A = { userId: "a", tenantId: "t", branchId: "a1" }
  const B = { userId: "b", tenantId: "t" }
  client.setQueryData(["session"], { id: "a" })
  assert.equal(guard.sync(A), false)
  client.setQueryData(qk("students"), [1])
  assert.equal(guard.sync(A), false)
  assert.ok(client.getQueryData(qk("students")))
  assert.equal(guard.sync({ ...A, branchId: "x" }), true) // branch switch
  assert.equal(client.getQueryData([scopeKey(A), "students"]), undefined)
  client.setQueryData(qk("students"), [2])
  assert.equal(guard.sync(B), true) // user change
  assert.equal(client.getQueryData([scopeKey({ ...A, branchId: "x" }), "students"]), undefined)
  client.setQueryData(qk("students"), [3])
  assert.equal(guard.sync(null), true) // logout
  assert.equal(client.getQueryCache().getAll().filter((q) => q.queryKey[0] !== "session").length, 0)
  assert.ok(client.getQueryData(["session"]))
  setQueryScope(null)
})

test("mutation invalidation map", () => {
  assert.deepEqual(domainsToInvalidate("notices"), ["notices", "notifications"])
  assert.ok(domainsToInvalidate("students").includes("dashboard-summary"))
})

test("zustand stores hold UI state only (no tokens / API data)", () => {
  for (const f of fs.readdirSync(new URL("../src/stores/", import.meta.url))) {
    const src = fs.readFileSync(new URL(`../src/stores/${f}`, import.meta.url), "utf8")
    assert.doesNotMatch(src, /token|password|apiClient|axios|fetch\(|useQuery|Authorization/i, f)
    const persisted = [...src.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1])
    assert.ok(persisted.every((n) => n === "ui-store"), `unexpected persisted store in ${f}`)
  }
})

test("session cookie flags", async () => {
  const src = fs.readFileSync(new URL("../src/lib/session-cookies.ts", import.meta.url), "utf8")
  assert.match(src, /httpOnly: true/)
  assert.match(src, /sameSite: "lax"/)
  assert.match(src, /secure: process\.env\.NODE_ENV === "production"/)
})

// Derived from the contract snapshot (contracts/openapi.json, shared with PR #2), so a new
// token-returning operation fails this test until the proxy denies it.
function tokenReturningOps(spec) {
  const schemas = spec.components?.schemas ?? {}
  const has = (o, seen = new Set()) => {
    if (Array.isArray(o)) return o.some((v) => has(v, seen))
    if (!o || typeof o !== "object") return false
    if (o.$ref) {
      const n = o.$ref.split("/").pop()
      if (seen.has(n)) return false
      return has(schemas[n], new Set(seen).add(n))
    }
    if (o.properties && ("access_token" in o.properties || "refresh_token" in o.properties)) return true
    return Object.values(o).some((v) => has(v, seen))
  }
  const ops = []
  for (const [path, item] of Object.entries(spec.paths))
    for (const [method, op] of Object.entries(item))
      if (op && typeof op === "object" && has(op.responses)) ops.push({ method, path: path.replace(/^\/api\/v1/, "") })
  return ops
}

test("every token-returning operation in the OpenAPI snapshot is denied by the proxy", () => {
  const spec = JSON.parse(fs.readFileSync(new URL("../contracts/openapi.json", import.meta.url), "utf8"))
  const ops = tokenReturningOps(spec)
  assert.ok(ops.length >= 9, `found ${ops.length}`)
  for (const op of ops) assert.equal(validateProxyPath(op.path.split("/").filter(Boolean)), null, `${op.method} ${op.path}`)
})

test("auth/* is default-deny with a tiny allow-list", () => {
  for (const ok of [["auth", "me"], ["auth", "session"], ["auth", "users"], ["auth", "users", "abc"]])
    assert.ok(validateProxyPath(ok), ok.join("/"))
  for (const bad of [["auth", "switch-branch"], ["auth", "switch-year"], ["auth", "switch-user"], ["auth", "otp", "verify"], ["auth", "google"], ["auth", "unknown"], ["AUTH", "Google"], ["event-portal", "login"]])
    assert.equal(validateProxyPath(bad), null, bad.join("/"))
})

test("token keys are stripped from proxied JSON bodies", () => {
  const r = stripTokenKeys(JSON.stringify({ a: 1, nested: [{ access_token: "x", ok: 1 }], refresh_token: "y" }))
  assert.equal(r.stripped, true)
  assert.deepEqual(JSON.parse(r.text), { a: 1, nested: [{ ok: 1 }] })
  assert.deepEqual(stripTokenKeys('{"a":1}'), { text: '{"a":1}', stripped: false })
  assert.equal(stripTokenKeys("not json access_token").stripped, false)
})

test("x-forwarded-host uses the first list entry", () => {
  assert.equal(isSameOriginRequest("POST", H({ "x-forwarded-host": "a.com, proxy.internal", origin: "https://a.com" })), true)
  assert.equal(isSameOriginRequest("POST", H({ "x-forwarded-host": "evil.com, a.com", origin: "https://a.com" })), false)
})

test("single-flight keeps the settled result for the ttl, not on failure", async () => {
  _resetSingleFlight()
  let calls = 0
  const f = async () => ++calls
  assert.equal(await singleFlight("k", f, 50), 1)
  assert.equal(await singleFlight("k", f, 50), 1) // old refresh token reuses rotated pair
  await new Promise((r) => setTimeout(r, 70))
  assert.equal(await singleFlight("k", f, 50), 2)
  await assert.rejects(singleFlight("bad", async () => { throw new Error("x") }, 50))
  assert.equal(await singleFlight("bad", async () => "ok", 50), "ok")
  _resetSingleFlight()
})

test("branch and academic year re-scope the cache; identity events refetch session", async () => {
  const client = new QueryClient()
  let fire
  attachIdentityGuard(client, (cb) => { fire = cb; return () => {} })
  const user = { id: "u", tenant_id: "t" }
  const keys = []
  const unsub = subscribeQueryScope(() => keys.push(getScopeKey()))
  client.setQueryData(["session-context"], { branch_id: "b1", academic_year_id: "y1" })
  client.setQueryData(["session"], user)
  assert.equal(getScopeKey(), "t|u|b1|y1")
  client.setQueryData(qk("students"), [1])
  client.setQueryData(["session-context"], { branch_id: "b2", academic_year_id: "y1" })
  client.setQueryData(["session"], { ...user })
  assert.equal(getScopeKey(), "t|u|b2|y1")
  assert.equal(client.getQueryData(["t|u|b1|y1", "students"]), undefined)
  assert.ok(client.getQueryData(["session-context"]))
  assert.deepEqual(keys, ["t|u|b1|y1", "t|u|b2|y1"])
  assert.deepEqual(ctxToScopeCtx(null), { branchId: null, academicYearId: null })
  let refetched = 0
  client.invalidateQueries = () => { refetched++; return Promise.resolve() }
  fire()
  assert.equal(refetched, 1)
  unsub()
  setQueryScope(null)
})

test("stripTokenKeys keeps a legit __proto__ key and drops tokens", () => {
  const r = stripTokenKeys('{"__proto__":{"x":1},"access_token":"a","ok":1}')
  assert.equal(r.stripped, true)
  assert.ok(Object.prototype.hasOwnProperty.call(JSON.parse(r.text), "__proto__"))
  assert.equal(JSON.parse(r.text).ok, 1)
  assert.doesNotMatch(r.text, /access_token/)
  assert.equal(({}).x, undefined)
})

test("logout forgets the cached refresh result", async () => {
  _resetSingleFlight()
  let n = 0
  const key = refreshTokenKey("tok")
  await singleFlight(key, async () => ++n, 60_000)
  forgetSingleFlight(key)
  await singleFlight(key, async () => ++n, 60_000)
  assert.equal(n, 2)
  _resetSingleFlight()
})

test("transient /auth/session failures keep the previous context", () => {
  const prev = { branch_id: "b", academic_year_id: "y" }
  for (const status of [429, 500, 502, 0]) assert.equal(nextSessionContext(prev, status, undefined), prev)
  assert.equal(nextSessionContext(prev, 401, undefined), null)
  const fresh = { branch_id: "b2", academic_year_id: "y" }
  assert.equal(nextSessionContext(prev, 200, fresh), fresh)
})

test("unknown -> known branch/year for the same user does not purge or re-scope", () => {
  const client = new QueryClient()
  const guard = createIdentityGuard(client)
  const U = { userId: "u", tenantId: "t" }
  let scopeChanges = 0
  const unsub = subscribeQueryScope(() => scopeChanges++)
  guard.sync(U) // context unknown
  client.setQueryData(qk("students"), [1])
  const before = scopeChanges
  assert.equal(guard.sync({ ...U, branchId: "b", academicYearId: "y" }), false)
  assert.equal(scopeChanges, before)
  assert.deepEqual(client.getQueryData(qk("students")), [1])
  // a real switch afterwards still purges
  assert.equal(guard.sync({ ...U, branchId: "b2", academicYearId: "y" }), true)
  // a failed refetch must not flip known -> unknown for the same user
  assert.equal(guard.sync({ ...U, branchId: "b2", academicYearId: "y" }), false)
  unsub()
  setQueryScope(null)
})
