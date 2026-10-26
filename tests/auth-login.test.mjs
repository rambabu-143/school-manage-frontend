import assert from "node:assert/strict"
import fs from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"
import vm from "node:vm"

const require = createRequire(import.meta.url)
const ts = require(process.env.TYPESCRIPT_PATH || "typescript")

async function loadRoute({ loginResult, verifyError } = {}) {
  const calls = { cookies: 0, sessions: [], users: [], verifications: [] }
  class BackendError extends Error {
    constructor(status) { super("Backend error"); this.status = status }
  }
  const mocks = {
    "next/headers": { cookies: async () => { calls.cookies++; return {} } },
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/lib/session-cookies": { setSessionCookies: (_, tokens) => calls.sessions.push(tokens) },
    "@/lib/backend": {
      BackendError,
      loginRequest: async () => loginResult,
      verifyTwoFactorRequest: async (input) => {
        calls.verifications.push({ ...input })
        if (verifyError) throw new BackendError(verifyError)
        return { access_token: "verified-access", refresh_token: "verified-refresh" }
      },
      getCurrentUser: async (token) => { calls.users.push(token); return { id: "user-1" } },
    },
  }
  const source = fs.readFileSync(new URL("../src/app/api/auth/login/route.ts", import.meta.url), "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  })
  const context = vm.createContext({ Response })
  const mod = new vm.SourceTextModule(outputText, { context })
  await mod.link((specifier) => {
    const exports = mocks[specifier]
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
    }, { context })
  })
  await mod.evaluate()
  return { post: (body) => mod.namespace.POST(new Request("http://test/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  })), calls }
}

test("password login creates a session", async () => {
  const tokens = { access_token: "access", refresh_token: "refresh" }
  const { post, calls } = await loadRoute({ loginResult: tokens })
  const response = await post({ email: "admin@test.com", password: "password" })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { user: { id: "user-1" } })
  assert.deepEqual(calls.users, ["access"])
  assert.deepEqual(calls.sessions, [tokens])
})

test("2FA challenge creates no session and never calls /me", async () => {
  const challenge = { requires_2fa: true, two_factor_token: "pending" }
  const { post, calls } = await loadRoute({ loginResult: challenge })
  const response = await post({ email: "admin@test.com", password: "password" })
  assert.deepEqual(await response.json(), challenge)
  assert.equal(calls.cookies, 0)
  assert.deepEqual(calls.sessions, [])
  assert.deepEqual(calls.users, [])
})

for (const code of ["123456", "ABCD-EFGH"]) {
  test(`verification accepts authenticator/backup code ${code}`, async () => {
    const { post, calls } = await loadRoute()
    const response = await post({ two_factor_token: "pending", code })
    assert.equal(response.status, 200)
    assert.deepEqual(calls.verifications, [{ two_factor_token: "pending", code }])
    assert.deepEqual(calls.users, ["verified-access"])
    assert.equal(calls.sessions.length, 1)
  })
}

for (const status of [401, 429]) {
  test(`rejected verification (${status}) creates no session`, async () => {
    const { post, calls } = await loadRoute({ verifyError: status })
    const response = await post({ two_factor_token: "pending", code: "bad" })
    assert.equal(response.status, status)
    assert.deepEqual(calls.sessions, [])
    assert.equal(calls.cookies, 0)
  })
}

test("empty verification is rejected", async () => {
  const { post, calls } = await loadRoute()
  assert.equal((await post({ two_factor_token: "pending", code: " " })).status, 400)
  assert.deepEqual(calls.verifications, [])
})
