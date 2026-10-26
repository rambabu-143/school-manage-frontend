const { test, expect } = require("@playwright/test")
const { randomUUID } = require("node:crypto")
const { API, PASSWORD, call, school, signIn, totp } = require("./helpers.cjs")

test("unauthenticated navigation redirects to login", async ({ page }) => {
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/)
  expect((await page.request.get("/api/backend/auth/users")).status()).toBe(401)
})

test("password login reaches dashboard and sets HTTP-only cookies", async ({ page, request }) => {
  const admin = await school(request)
  await signIn(page, admin.email)
  await expect(page).toHaveURL(/\/dashboard$/)
  expect((await page.request.get("/api/auth/me")).status()).toBe(200)
  const session = (await page.context().cookies()).filter(c => ["access_token", "refresh_token"].includes(c.name))
  expect(session).toHaveLength(2)
  expect(session.every(c => c.httpOnly && c.sameSite === "Lax")).toBe(true)
  expect(await page.evaluate(() => document.cookie)).not.toContain("access_token")
})

test("2FA rejects a bad code, then authenticator code completes login", async ({ page, request }) => {
  const admin = await school(request)
  const setup = await call(request, "POST", "/auth/2fa/setup", {}, admin.token)
  await call(request, "POST", "/auth/2fa/enable", { code: totp(setup.secret) }, admin.token)
  await signIn(page, admin.email)
  await expect(page.getByLabel("Verification code", { exact: true })).toBeVisible()
  expect((await page.context().cookies()).some(c => c.name === "access_token")).toBe(false)
  await page.getByLabel("Verification code", { exact: true }).fill("invalid")
  await page.getByRole("button", { name: "Verify and sign in" }).click()
  await expect(page.locator('p[role="alert"]')).toContainText("Invalid or expired")
  await page.getByLabel("Verification code", { exact: true }).fill(totp(setup.secret))
  await page.getByRole("button", { name: "Verify and sign in" }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
})

test("backup code signs in and cannot be reused", async ({ page, request }) => {
  const admin = await school(request)
  const setup = await call(request, "POST", "/auth/2fa/setup", {}, admin.token)
  const enabled = await call(request, "POST", "/auth/2fa/enable", { code: totp(setup.secret) }, admin.token)
  await signIn(page, admin.email)
  await page.getByLabel("Verification code", { exact: true }).fill(enabled.backup_codes[0])
  await page.getByRole("button", { name: "Verify and sign in" }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.request.post("/api/auth/logout")
  await page.context().clearCookies()
  await signIn(page, admin.email)
  await page.getByLabel("Verification code", { exact: true }).fill(enabled.backup_codes[0])
  await page.getByRole("button", { name: "Verify and sign in" }).click()
  await expect(page.locator('p[role="alert"]')).toContainText("Invalid or expired")
})

test("teacher session cannot create users through the frontend proxy", async ({ page, request }) => {
  const admin = await school(request)
  const email = `qa-teacher-${randomUUID()}@example.com`
  await call(request, "POST", "/auth/users", { email, password: PASSWORD, role: "teacher" }, admin.token, 201)
  await signIn(page, email)
  await expect(page).toHaveURL(/\/dashboard$/)
  expect((await page.request.post("/api/backend/auth/users", {
    data: { email: `qa-denied-${randomUUID()}@example.com`, password: PASSWORD, role: "school_admin" },
  })).status()).toBe(403)
})

test("another tenant cannot list or read a school's student", async ({ request }) => {
  const first = await school(request)
  const second = await school(request)
  const branch = await call(request, "POST", "/branches", { name: "QA", code: "QA" }, first.token, 201)
  const student = await call(request, "POST", "/students", {
    branch_id: branch.id, admission_number: "QA-1", first_name: "Private", last_name: "Student", date_of_birth: "2015-04-12",
  }, first.token, 201)
  const response = await request.get(API + `/students/${student.id}`, { headers: { Authorization: `Bearer ${second.token}` } })
  expect(response.status()).toBe(404)
  const listing = await call(request, "GET", "/students", undefined, second.token)
  expect(listing).toEqual([])
})
