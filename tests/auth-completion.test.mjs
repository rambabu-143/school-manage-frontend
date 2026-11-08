import assert from "node:assert/strict"
import test from "node:test"

import { fakeCookies, loadTs } from "./helpers/load-ts.mjs"

const nextServer = { NextResponse: { json: (b, i) => Response.json(b, i) } }
const UUID = "11111111-1111-4111-8111-111111111111"

async function cookieLib() {
  return loadTs("src/lib/session-cookies.ts", { "next/headers": {} }, { process: { env: { NODE_ENV: "test" } } })
}

test("impersonation parks admin tokens and exit restores them", async () => {
  const c = await cookieLib()
  const jar = fakeCookies({ access_token: "A", refresh_token: "R" })
  c.startImpersonationCookies(jar, "IMP", 900)
  assert.equal(jar.jar.get("access_token"), "IMP")
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
  const { route, jar } = await impersonateRoute(() => Response.json({ access_token: "IMP", expires_in: 900 }))
  const res = await route.POST(new Request("http://t", { method: "POST", body: JSON.stringify({ user_id: UUID }) }))
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { ok: true })
  assert.equal(jar.jar.get("access_token"), "IMP")
  assert.equal(jar.jar.get("admin_access_token"), "A")
})

test("impersonate rejects bad id and surfaces backend 403", async () => {
  const { route } = await impersonateRoute(() => Response.json({ detail: "Cannot switch user from an impersonated session" }, { status: 403 }))
  const bad = await route.POST(new Request("http://t", { method: "POST", body: JSON.stringify({ user_id: "x" }) }))
  assert.equal(bad.status, 400)
  const forbidden = await route.POST(new Request("http://t", { method: "POST", body: JSON.stringify({ user_id: UUID }) }))
  assert.equal(forbidden.status, 403)
})

test("impersonate DELETE without a parked session is 409", async () => {
  const { route } = await impersonateRoute(() => Response.json({}))
  assert.equal((await route.DELETE()).status, 409)
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
  const res = await route.POST(new Request("http://t", { method: "POST", body: JSON.stringify({ branch_id: UUID }) }))
  assert.equal(res.status, 200)
  assert.equal(jar.jar.get("access_token"), "A2")
  assert.equal(jar.jar.get("refresh_token"), "R2")
  assert.equal((await route.POST(new Request("http://t", { method: "POST", body: "{}" }))).status, 400)
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
      "@/lib/bff": { readJson: async (r) => r.json() },
      "@/lib/jwt-claims": claims,
      "@/lib/session-cookies": { setSessionCookies: (j, t) => j.set("access_token", t.access_token) },
    })
    const res = await route.POST(new Request("http://t", { method: "POST", body: JSON.stringify({ id_token: payload(tokenNonce) }) }))
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
