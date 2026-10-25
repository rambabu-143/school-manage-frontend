const { createHmac, randomUUID } = require("node:crypto")
const { expect } = require("@playwright/test")

const API = "http://127.0.0.1:8100/api/v1"
const PASSWORD = "QA-synthetic-password-123!"

async function call(request, method, path, data, token, status = 200) {
  const response = await request.fetch(API + path, {
    method, data, headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  expect(response.status(), `${method} ${path}`).toBe(status)
  return response.json()
}

async function school(request) {
  const suffix = randomUUID()
  const email = `qa-${suffix}@example.com`
  const tenant = await call(request, "POST", "/tenants", {
    name: `QA ${suffix}`, owner_email: email, owner_password: PASSWORD,
  }, undefined, 201)
  const login = await request.post(API + "/auth/login", { form: { username: email, password: PASSWORD } })
  expect(login.status()).toBe(200)
  return { tenant, email, token: (await login.json()).access_token }
}

async function signIn(page, email) {
  await page.goto("/login")
  await page.getByLabel("Email", { exact: true }).fill(email)
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD)
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
}

function totp(secret, seconds = Math.floor(Date.now() / 1000)) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  const bits = [...secret.toUpperCase().replace(/=+$/, "")]
    .map((char) => alphabet.indexOf(char).toString(2).padStart(5, "0")).join("")
  const key = Buffer.from((bits.match(/.{8}/g) || []).map((byte) => parseInt(byte, 2)))
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(Math.floor(seconds / 30)))
  const digest = createHmac("sha1", key).update(counter).digest()
  const offset = digest.at(-1) & 15
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, "0")
}

module.exports = { API, PASSWORD, call, school, signIn, totp }
