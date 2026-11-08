import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import { QueryClient } from "@tanstack/react-query"

import { isSameOriginRequest, validateProxyPath, buildUpstreamHeaders, buildResponseHeaders, sanitizeErrorBody, readBodyLimited } from "../src/lib/bff-guards.ts"
import { safeNext } from "../src/lib/safe-redirect.ts"
import { singleFlight } from "../src/lib/single-flight.ts"
import { qk, scopeKey, setQueryScope } from "../src/lib/query-keys.ts"
import { staleTimeFor, shouldRetry, pollInterval } from "../src/lib/query-policy.ts"
import { createIdentityGuard } from "../src/lib/identity-lifecycle.ts"
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
  const A = { userId: "a", tenantId: "t" }
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
