const { test, expect } = require("@playwright/test")
const { createHmac, randomUUID } = require("node:crypto")
const { API, PASSWORD, call, school, signIn } = require("./helpers.cjs")

async function checkoutSchool(request) {
  const admin = await school(request)
  const branch = await call(request, "POST", "/branches", { name: "QA", code: "QA" }, admin.token, 201)
  const year = await call(request, "POST", "/academic-years", {
    name: "2026-2027", start_date: "2026-04-01", end_date: "2027-03-31",
  }, admin.token, 201)
  const student = await call(request, "POST", "/students", {
    branch_id: branch.id, admission_number: "QA-1", first_name: "QA", last_name: "Child", date_of_birth: "2015-04-12",
  }, admin.token, 201)
  const email = `qa-parent-${randomUUID()}@example.com`
  const parent = await call(request, "POST", "/auth/users", { email, password: PASSWORD, role: "parent" }, admin.token, 201)
  await call(request, "POST", `/students/${student.id}/guardians`, {
    user_id: parent.id, name: "QA Parent", relation: "father",
  }, admin.token, 201)
  const invoice = await call(request, "POST", "/invoices", {
    student_id: student.id, academic_year_id: year.id, amount: "1000.00", due_date: "2026-09-01",
  }, admin.token, 201)
  await call(request, "PUT", "/payment-gateway-config", {
    key_id: "rzp_test_qa", key_secret: "qa-gateway-secret", webhook_secret: "qa-webhook-secret",
  }, admin.token)
  return { admin, email, invoice, student, branch }
}

async function webhook(request, tenantId, event, orderId) {
  const body = JSON.stringify({ event, payload: { payment: { entity: { id: "pay_qa_browser", order_id: orderId } } } })
  return request.post(API + `/webhooks/razorpay/${tenantId}`, {
    data: body, headers: {
      "Content-Type": "application/json",
      "X-Razorpay-Signature": createHmac("sha256", "qa-webhook-secret").update(body).digest("hex"),
    },
  })
}

test("parent checkout credits the invoice once, including duplicate webhook delivery", async ({ page, request }) => {
  const data = await checkoutSchool(request)
  let gatewayOrderId
  await page.exposeFunction("__qaCheckout", async (orderId) => {
    gatewayOrderId = orderId
    return {
      razorpay_order_id: orderId, razorpay_payment_id: "pay_qa_browser",
      razorpay_signature: createHmac("sha256", "qa-gateway-secret").update(`${orderId}|pay_qa_browser`).digest("hex"),
    }
  })
  // Only the third-party SDK is simulated. All app/backend requests are real.
  await page.route("https://checkout.razorpay.com/v1/checkout.js", route => route.fulfill({
    contentType: "application/javascript",
    body: `window.Razorpay = class {
      constructor(options) { this.options = options }
      async open() { this.options.handler(await window.__qaCheckout(this.options.order_id)) }
    }`,
  }))
  await signIn(page, data.email)
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.goto("/portal")
  await page.getByRole("tab", { name: "Fees", exact: true }).click()
  await page.getByRole("button", { name: "Pay Now" }).click()
  await expect(page.getByText("paid", { exact: true })).toBeVisible()
  expect((await webhook(request, data.admin.tenant.id, "payment.captured", gatewayOrderId)).status()).toBe(200)
  const payments = await call(request, "GET", `/invoices/${data.invoice.id}/payments`, undefined, data.admin.token)
  expect(payments).toHaveLength(1)
  expect(payments[0].amount).toBe("1000.00")
})

test("failed order with a forged checkout signature cannot pay an invoice", async ({ page, request }) => {
  const data = await checkoutSchool(request)
  await signIn(page, data.email)
  await expect(page).toHaveURL(/\/dashboard$/)
  const orderResponse = await page.request.post("/api/backend/payment-orders", { data: { invoice_id: data.invoice.id } })
  expect(orderResponse.status()).toBe(201)
  const order = await orderResponse.json()
  expect((await webhook(request, data.admin.tenant.id, "payment.failed", order.gateway_order_id)).status()).toBe(200)
  const forged = await page.request.post(`/api/backend/payment-orders/${order.id}/verify`, { data: {
    razorpay_order_id: order.gateway_order_id, razorpay_payment_id: "fake", razorpay_signature: "fake",
  } })
  expect(forged.status()).toBe(400)
  const invoice = await call(request, "GET", `/invoices/${data.invoice.id}`, undefined, data.admin.token)
  expect(invoice.status).toBe("unpaid")
  expect(await call(request, "GET", `/invoices/${data.invoice.id}/payments`, undefined, data.admin.token)).toEqual([])
})

test("parent cannot access an unlinked child's invoices", async ({ page, request }) => {
  const data = await checkoutSchool(request)
  const other = await call(request, "POST", "/students", {
    branch_id: data.branch.id, admission_number: "QA-2", first_name: "Other", last_name: "Child", date_of_birth: "2015-04-12",
  }, data.admin.token, 201)
  await signIn(page, data.email)
  await expect(page).toHaveURL(/\/dashboard$/)
  const response = await page.request.get(`/api/backend/me/children/${other.id}/invoices`)
  expect(response.status()).toBe(403)
})
