import assert from "node:assert/strict"
import test from "node:test"

import { fakeCookies, loadTs } from "./helpers/load-ts.mjs"

const impToken = `h.${Buffer.from(JSON.stringify({ imp: "admin" })).toString("base64url")}.s`
const nextServer = { NextResponse: { json: (b, i) => Response.json(b, i) } }
const JSON_H = { "Content-Type": "application/json" }
const UUID = "11111111-1111-4111-8111-111111111111"

async function cookieLib() {
  const claims = await loadTs("src/lib/jwt-claims.ts", {})
  return loadTs("src/lib/session-cookies.ts", { "next/headers": {}, "@/lib/jwt-claims": claims }, { process: { env: { NODE_ENV: "test" } } })
}

test("impersonation parks admin tokens and exit restores them", async () => {
  const c = await cookieLib()
  const jar = fakeCookies({ access_token: "A", refresh_token: "R" })
  c.startImpersonationCookies(jar, impToken, 900)
  assert.equal(jar.jar.get("access_token"), impToken)
  assert.equal(jar.jar.has("refresh_token"), false)
  assert.equal(jar.jar.get("admin_access_token"), "A")
  assert.equal(jar.jar.get("admin_refresh_token"), "R")
  assert.equal(c.restoreAdminCookies(jar), true)
  assert.equal(jar.jar.get("access_token"), "A")
  assert.equal(jar.jar.get("refresh_token"), "R")
  assert.equal(jar.jar.has("admin_access_token"), false)
  assert.equal(c.restoreAdminCookies(jar), false)
})

test("clearSessionCookies also drops parked admin tokens", async () => {
  const c = await cookieLib()
  const jar = fakeCookies({ access_token: "I", admin_access_token: "A", admin_refresh_token: "R" })
  c.clearSessionCookies(jar)
  assert.equal(jar.jar.size, 0)
})

async function impersonateRoute(backend) {
  const jar = fakeCookies({ access_token: "A", refresh_token: "R" })
  const cookies = await cookieLib()
  const bff = await loadTs("src/lib/bff.ts", {
    "next/headers": { cookies: async () => jar },
    "next/server": nextServer,
    "@/lib/authed-backend-fetch": {
      SessionExpiredError: class extends Error {},
      authedBackendFetch: async (_j, path, init) => backend(path, init),
    },
    "@/lib/session-cookies": cookies,
  })
  const route = await loadTs("src/app/api/auth/impersonate/route.ts", {
    "next/headers": { cookies: async () => jar },
    "next/server": nextServer,
    "@/lib/bff": bff,
    "@/lib/session-cookies": cookies,
  })
  return { route, jar }
}

test("impersonate POST swaps cookies and never returns tokens", async () => {
  const { route, jar } = await impersonateRoute(() => Response.json({ access_token: impToken, expires_in: 900 }))
  const res = await route.POST(new Request("http://t", { method: "POST", headers: JSON_H, body: JSON.stringify({ user_id: UUID }) }))
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { ok: true })
  assert.equal(jar.jar.get("access_token"), impToken)
  assert.equal(jar.jar.get("admin_access_token"), "A")
})

test("impersonate rejects bad id and surfaces backend 403", async () => {
  const { route } = await impersonateRoute(() => Response.json({ detail: "Cannot switch user from an impersonated session" }, { status: 403 }))
  const bad = await route.POST(new Request("http://t", { method: "POST", headers: JSON_H, body: JSON.stringify({ user_id: "x" }) }))
  assert.equal(bad.status, 400)
  const forbidden = await route.POST(new Request("http://t", { method: "POST", headers: JSON_H, body: JSON.stringify({ user_id: UUID }) }))
  assert.equal(forbidden.status, 403)
})

test("impersonate DELETE without a parked session is 409", async () => {
  const { route } = await impersonateRoute(() => Response.json({}))
  assert.equal((await route.DELETE(new Request("http://t", { method: "DELETE" }))).status, 409)
})

test("switch-branch rotates cookies from the backend token pair", async () => {
  const jar = fakeCookies({ access_token: "A", refresh_token: "R" })
  const cookies = await cookieLib()
  const bff = await loadTs("src/lib/bff.ts", {
    "next/headers": { cookies: async () => jar },
    "next/server": nextServer,
    "@/lib/authed-backend-fetch": {
      SessionExpiredError: class extends Error {},
      authedBackendFetch: async () => Response.json({ access_token: "A2", refresh_token: "R2" }),
    },
    "@/lib/session-cookies": cookies,
  })
  const route = await loadTs("src/app/api/auth/switch-branch/route.ts", { "next/server": nextServer, "@/lib/bff": bff })
  const res = await route.POST(new Request("http://t", { method: "POST", headers: JSON_H, body: JSON.stringify({ branch_id: UUID }) }))
  assert.equal(res.status, 200)
  assert.equal(jar.jar.get("access_token"), "A2")
  assert.equal(jar.jar.get("refresh_token"), "R2")
  assert.equal((await route.POST(new Request("http://t", { method: "POST", headers: JSON_H, body: "{}" }))).status, 400)
})

test("google login requires the nonce bound to this browser", async () => {
  const payload = (nonce) => `h.${Buffer.from(JSON.stringify({ nonce })).toString("base64url")}.s`
  const run = async (cookieNonce, tokenNonce) => {
    const jar = fakeCookies(cookieNonce ? { g_nonce: cookieNonce } : {})
    let called = 0
    const claims = await loadTs("src/lib/jwt-claims.ts", {})
    const route = await loadTs("src/app/api/auth/google/route.ts", {
      "next/headers": { cookies: async () => jar },
      "next/server": nextServer,
      "@/lib/backend": {
        BackendError: class extends Error {},
        backendFetch: async () => { called++; return Response.json({ access_token: "a", refresh_token: "r" }) },
        getCurrentUser: async () => ({ id: "u" }),
      },
      "@/lib/bff": { readJson: async (r) => r.json(), rejectCrossSite: () => null, rateLimited: () => Response.json({}, { status: 429 }) },
      "@/lib/jwt-claims": claims,
      "@/lib/session-cookies": { setSessionCookies: (j, t) => j.set("access_token", t.access_token) },
    })
    const res = await route.POST(new Request("http://t", { method: "POST", headers: JSON_H, body: JSON.stringify({ id_token: payload(tokenNonce) }) }))
    return { status: res.status, called, jar }
  }
  assert.equal((await run("n1", "n2")).called, 0)
  assert.equal((await run(undefined, "n1")).status, 400)
  const ok = await run("n1", "n1")
  assert.equal(ok.status, 200)
  assert.equal(ok.jar.jar.get("access_token"), "a")
})

test("role guard: access, impersonation targets, route roles", async () => {
  const guard = await loadTs("src/lib/role-guard.ts", {
    "@/components/layout/nav-config": {
      NAV_ITEMS: [
        { href: "/users", roles: ["school_admin"] },
        { href: "/users/audit", roles: ["super_admin"] },
        { href: "/dashboard" },
      ],
    },
  })
  assert.equal(guard.canAccess("teacher", undefined), true)
  assert.equal(guard.canAccess("teacher", ["school_admin"]), false)
  assert.equal(guard.canImpersonateTarget("school_admin", "teacher"), true)
  assert.equal(guard.canImpersonateTarget("school_admin", "school_admin"), false)
  assert.equal(guard.canImpersonateTarget("teacher", "student"), false)
  assert.deepEqual([...guard.rolesForPath("/users/audit/x")], ["super_admin"])
  assert.deepEqual([...guard.rolesForPath("/users")], ["school_admin"])
  assert.equal(guard.rolesForPath("/dashboard"), undefined)
  assert.equal(guard.rolesForPath("/nowhere"), undefined)
})

test("stale parked admin tokens are never restored without an imp token", async () => {
  const c = await cookieLib()
  const jar = fakeCookies({ access_token: "plain-user-token", admin_access_token: "A", admin_refresh_token: "R" })
  assert.equal(c.restoreAdminCookies(jar), false)
  assert.equal(jar.jar.get("access_token"), "plain-user-token")
  assert.equal(jar.jar.has("admin_access_token"), false)
  assert.equal(jar.jar.has("admin_refresh_token"), false)
})

test("a normal sign-in clears parked admin tokens", async () => {
  const c = await cookieLib()
  const jar = fakeCookies({ admin_access_token: "A", admin_refresh_token: "R" })
  c.setSessionCookies(jar, { access_token: "B", refresh_token: "BR" })
  assert.equal(jar.jar.has("admin_access_token"), false)
  assert.equal(jar.jar.has("admin_refresh_token"), false)
})

test("impersonate DELETE with stale stash is 409 and swaps nothing", async () => {
  const { route, jar } = await impersonateRoute(() => Response.json({}))
  jar.jar.set("admin_access_token", "A")
  assert.equal((await route.DELETE(new Request("http://t", { method: "DELETE" }))).status, 409)
  assert.equal(jar.jar.get("access_token"), "A")
  assert.equal(jar.jar.has("admin_access_token"), false)
})

test("logout during impersonation revokes both refresh tokens and clears everything", async () => {
  const revoked = []
  const forgotten = []
  const jar = fakeCookies({ access_token: impToken, admin_access_token: "A", admin_refresh_token: "ADMIN_R" })
  const cookies = await cookieLib()
  const bff = await loadTs("src/lib/bff.ts", {
    "next/headers": { cookies: async () => jar }, "next/server": nextServer,
    "@/lib/authed-backend-fetch": { SessionExpiredError: class extends Error {}, authedBackendFetch: async () => Response.json({}) },
    "@/lib/session-cookies": cookies,
  })
  const route = await loadTs("src/app/api/auth/logout/route.ts", {
    "next/headers": { cookies: async () => jar }, "next/server": nextServer, "@/lib/bff": bff, "@/lib/session-cookies": cookies,
    "@/lib/single-flight": { refreshTokenKey: (t) => `k:${t}`, forgetSingleFlight: (k) => forgotten.push(k) },
    "@/lib/backend": { backendFetch: async (_p, init) => { revoked.push(JSON.parse(init.body).refresh_token); return new Response(null, { status: 204 }) } },
  })
  const res = await route.POST(new Request("http://t", { method: "POST" }))
  assert.equal(res.status, 200)
  assert.deepEqual(revoked, ["ADMIN_R"])
  assert.deepEqual(forgotten, ["k:ADMIN_R"]) // the 30 s refresh cache must forget revoked tokens
  assert.equal(jar.jar.size, 0)
})

test("CSRF guard rejects cross-site, bad origin and non-JSON bodies", async () => {
  const bff = await loadTs("src/lib/bff.ts", {
    "next/headers": { cookies: async () => ({}) }, "next/server": nextServer, "@/lib/authed-backend-fetch": { SessionExpiredError: class {}, authedBackendFetch: async () => null }, "@/lib/session-cookies": { setSessionCookies() {} },
  })
  const req = (headers) => new Request("http://app.test/x", { method: "POST", headers })
  assert.equal(bff.rejectCrossSite(req({ "sec-fetch-site": "cross-site" })).status, 403)
  assert.equal(bff.rejectCrossSite(req({ origin: "http://evil.test", host: "app.test" })).status, 403)
  assert.equal(bff.rejectCrossSite(req({ "content-type": "text/plain" }), { json: true }).status, 415)
  assert.equal(bff.rejectCrossSite(req({ "sec-fetch-site": "same-origin", origin: "http://app.test", host: "app.test", "content-type": "application/json" }), { json: true }), null)
})

test("429 keeps status and Retry-After", async () => {
  const bff = await loadTs("src/lib/bff.ts", {
    "next/headers": { cookies: async () => ({}) }, "next/server": { NextResponse: { json: (b, i) => Response.json(b, i) } }, "@/lib/authed-backend-fetch": { SessionExpiredError: class {}, authedBackendFetch: async () => null }, "@/lib/session-cookies": { setSessionCookies() {} },
  })
  const res = bff.rateLimited(new Response(null, { status: 429, headers: { "retry-after": "42" } }), "slow down")
  assert.equal(res.status, 429)
  assert.equal(res.headers.get("retry-after"), "42")
})

test("students admin-only subpaths override the all-staff students entry", async () => {
  const guard = await loadTs("src/lib/role-guard.ts", {
    "@/components/layout/nav-config": {
      NAV_ITEMS: [
        { href: "/students", roles: ["school_admin", "teacher", "accountant"] },
        { href: "/students/import", roles: ["school_admin"] },
        { href: "/students/mcop-login", roles: ["school_admin"] },
        { href: "/students/promotion", roles: ["school_admin"] },
      ],
    },
  })
  for (const p of ["/students/import", "/students/mcop-login", "/students/promotion"]) {
    assert.equal(guard.canAccessPath("teacher", p), false)
    assert.equal(guard.canAccessPath("school_admin", p), true)
  }
  assert.equal(guard.canAccessPath("teacher", "/students"), true)
})

test("role guard is default-deny for unknown paths", async () => {
  const guard = await loadTs("src/lib/role-guard.ts", {
    "@/components/layout/nav-config": { NAV_ITEMS: [{ href: "/users", roles: ["school_admin"] }, { href: "/notices" }] },
  })
  assert.equal(guard.canAccessPath("teacher", "/notices"), true)
  assert.equal(guard.canAccessPath("teacher", "/users"), false)
  assert.equal(guard.canAccessPath("teacher", "/settings/security"), true)
  assert.equal(guard.canAccessPath("teacher", "/mystery"), false)
  assert.equal(guard.canAccessPath("school_admin", "/mystery"), true)
})

async function realBff() {
  return loadTs("src/lib/bff.ts", {
    "next/headers": { cookies: async () => ({}) }, "next/server": nextServer,
    "@/lib/authed-backend-fetch": { SessionExpiredError: class {}, authedBackendFetch: async () => null },
    "@/lib/session-cookies": { setSessionCookies() {} },
  })
}

test("CSRF guard honours x-forwarded-host/proto behind a proxy", async () => {
  const bff = await realBff()
  const req = (h) => new Request("http://internal:3000/x", { method: "POST", headers: h })
  assert.equal(bff.rejectCrossSite(req({ origin: "https://school.test", host: "internal:3000", "x-forwarded-host": "school.test, other", "x-forwarded-proto": "https" })), null)
  assert.equal(bff.rejectCrossSite(req({ origin: "http://school.test", "x-forwarded-host": "school.test", "x-forwarded-proto": "https" })).status, 403)
  assert.equal(bff.rejectCrossSite(req({ origin: "https://school.test", host: "internal:3000" })).status, 403)
})

test("login and password-reset routes reject cross-site and text/plain, and bad JSON is 400", async () => {
  const bff = await realBff()
  const backend = { BackendError: class extends Error {}, loginRequest: async () => ({}), verifyTwoFactorRequest: async () => ({}), getCurrentUser: async () => ({}),
    confirmPasswordReset: async () => {}, requestPasswordReset: async () => {} }
  const mocks = { "next/headers": { cookies: async () => ({}) }, "next/server": nextServer, "@/lib/bff": bff, "@/lib/backend": backend,
    "@/lib/session-cookies": { setSessionCookies() {} } }
  for (const path of ["login", "password-reset/request", "password-reset/confirm"]) {
    const route = await loadTs(`src/app/api/auth/${path}/route.ts`, mocks)
    const post = (headers, body) => route.POST(new Request("http://app.test/x", { method: "POST", headers, body }))
    assert.equal((await post({ "sec-fetch-site": "cross-site", ...JSON_H }, "{}")).status, 403, path)
    assert.equal((await post({ origin: "http://evil.test", host: "app.test", ...JSON_H }, "{}")).status, 403, path)
    assert.equal((await post({ "content-type": "text/plain" }, "{}")).status, 415, path)
    assert.equal((await post(JSON_H, "not json")).status, 400, path)
  }
})
