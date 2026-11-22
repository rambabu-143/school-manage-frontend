import { ADMIN_ROLES } from "../types/auth"
import { buildPayload } from "./ops/form"
import type { Field } from "./ops/types"
import type { Role } from "../types/auth"

// Admission registration / report / sibling / tally operations (backend admissions routers).
// Most take branch_id + academic_year_id as QUERY params (even POST reports), path params in the
// URL, and the remaining fields in the JSON body (POST/PUT) or the query string (GET/DELETE).
// Pure module so tests/admission.test.mjs can check every op against contracts/openapi.json.

export type AdmDomain = "admission-registrations" | "admission-reports" | "admission-siblings" | "admission-tally"
export type AdmGroup = "registrations" | "reports" | "siblings" | "tally"

export interface AdmOp {
  key: string
  group: AdmGroup
  title: string
  domain: AdmDomain
  method: "get" | "post" | "put" | "delete"
  path: string
  /** Which scope params the route requires as query params. */
  ctx: "both" | "year" | "none"
  fields: Field[]
  /** Whole body is this lines field as an array (dashboard routes). */
  bodyList?: string
  /** multipart/form-data upload (CSV import). */
  multipart?: boolean
  /** Changes data (or sends messages): confirm first, then invalidate the domain. */
  confirm?: string
  roles?: readonly Role[]
}

const P = (name: string, label: string, kind: Field["kind"] = "text"): Field => ({ name, label, kind, required: true, pathParam: true })
const CLASS = P("class_name", "Class (e.g. NURSERY)")
const GENDER: Field = { name: "gender", label: "Gender (ALL, M, F)" }
const T = { ctx: "both" } as const

export const ADMISSION_OPS: AdmOp[] = [
  // ---- registrations ----
  { key: "reg-search", group: "registrations", title: "Search registrations", domain: "admission-registrations", method: "post", path: "/admission/online-registration/search", ...T,
    fields: [{ name: "registration_no", label: "Registration no." }, { name: "name", label: "Name" }, { name: "mobile", label: "Mobile" }, { name: "class", label: "Class" }, { name: "branch", label: "Sub-branch code", kind: "number" }, { name: "search_type", label: "Search type" }, { name: "value", label: "Value" }] },
  { key: "reg-by-class", group: "registrations", title: "Registrations by class", domain: "admission-registrations", method: "get", path: "/admission/online-registration/by-class/{class_name}", ...T,
    fields: [CLASS, { name: "branch_code", label: "Sub-branch code", kind: "number" }] },
  { key: "reg-detail", group: "registrations", title: "Registration detail", domain: "admission-registrations", method: "get", path: "/admission/online-registration/{reg_id}", ctx: "none", fields: [P("reg_id", "Registration id")] },
  { key: "reg-validate-mobile", group: "registrations", title: "Validate pre-registered mobile", domain: "admission-registrations", method: "get", path: "/admission/online-registration/validate-mobile", ...T,
    fields: [{ name: "mobileno", label: "Mobile number", required: true }] },
  { key: "reg-update", group: "registrations", title: "Update registration", domain: "admission-registrations", method: "put", path: "/admission/online-registration/{reg_id}", ctx: "none",
    confirm: "Update this registration? Only the fields you fill in are changed.",
    fields: [P("reg_id", "Registration id"), { name: "status", label: "Status" }, { name: "category", label: "Category" }, { name: "mobile_no", label: "Mobile" }, { name: "reg_amount", label: "Registration amount" }] },
  { key: "reg-delete", group: "registrations", title: "Delete registration", domain: "admission-registrations", method: "delete", path: "/admission/online-registration/{reg_id}", ctx: "none", roles: ADMIN_ROLES,
    confirm: "Delete this registration? It is removed from every list.", fields: [P("reg_id", "Registration id")] },
  // ---- reports ----
  { key: "rep-generate-list", group: "reports", title: "Generate list", domain: "admission-reports", method: "post", path: "/admission/report/generate-list", ...T,
    fields: [{ name: "class", label: "Class", required: true }, { name: "status", label: "Status", required: true }, { name: "phase", label: "Phase", kind: "number", required: true }, { name: "final_status", label: "Final status" }, GENDER, { name: "branch", label: "Sub-branch code", kind: "number" }, { name: "category", label: "Category" }, { name: "candidate_type", label: "Candidate type" }, { name: "order", label: "Order" }] },
  { key: "rep-category", group: "reports", title: "Category report", domain: "admission-reports", method: "post", path: "/admission/report/category-report", ...T, fields: [{ name: "class", label: "Class", required: true }, GENDER] },
  { key: "rep-attendance", group: "reports", title: "Attendance report", domain: "admission-reports", method: "post", path: "/admission/report/attendance-report", ...T,
    fields: [{ name: "class", label: "Class", required: true }, { name: "phase", label: "Phase", kind: "number", required: true }, { name: "room_no", label: "Room (ALL or id)" }] },
  { key: "rep-cfi", group: "reports", title: "CFI report", domain: "admission-reports", method: "post", path: "/admission/report/cfi-reports", ...T,
    fields: [{ name: "class", label: "Class", required: true }, { name: "branch", label: "Sub-branch code", kind: "number" }, GENDER, { name: "category", label: "Category" }] },
  { key: "rep-dashboard", group: "reports", title: "Dashboard counts", domain: "admission-reports", method: "post", path: "/admission/report/dashboard", ...T, bodyList: "classes",
    fields: [{ name: "classes", label: "Classes", kind: "lines", required: true, help: "One class per line." }] },
  { key: "rep-master-dashboard", group: "reports", title: "Master dashboard (all branches)", domain: "admission-reports", method: "post", path: "/admission/report/master-dashboard", ctx: "year", bodyList: "classes",
    fields: [{ name: "classes", label: "Classes", kind: "lines", required: true, help: "One class per line." }] },
  { key: "rep-sticker", group: "reports", title: "Stickers", domain: "admission-reports", method: "get", path: "/admission/report/sticker/{class_name}/{phase}/{room_no}/{order}", ...T,
    fields: [CLASS, P("phase", "Phase", "number"), P("room_no", "Room no."), P("order", "Order")] },
  { key: "rep-all-registered", group: "reports", title: "All registered", domain: "admission-reports", method: "get", path: "/admission/report/all-registered/{class_name}", ...T, fields: [CLASS] },
  { key: "rep-special-needs", group: "reports", title: "Special needs", domain: "admission-reports", method: "get", path: "/admission/report/special-needs/{class_name}", ...T, fields: [CLASS] },
  { key: "rep-home-visit", group: "reports", title: "Home visit", domain: "admission-reports", method: "get", path: "/admission/report/home-visit/{class_name}", ...T, fields: [CLASS] },
  { key: "rep-sms-email", group: "reports", title: "Message recipients", domain: "admission-reports", method: "post", path: "/admission/report/sms-email", ...T,
    fields: [{ name: "class", label: "Class", required: true }, { name: "phase", label: "Phase", kind: "number", required: true }, { name: "selected_status", label: "Selection status", required: true }, GENDER, { name: "category", label: "Category" }, { name: "branch", label: "Sub-branch code", kind: "number" }, { name: "room_no", label: "Room (ALL or id)" }] },
  // ---- siblings + admission details ----
  { key: "sib-by-class", group: "siblings", title: "Sibling forms by class", domain: "admission-siblings", method: "get", path: "/admission/sibling-detail/all/{class_name}", ...T, fields: [CLASS] },
  { key: "sib-detail", group: "siblings", title: "Sibling form detail", domain: "admission-siblings", method: "get", path: "/admission/sibling-detail/{sib_id}", ctx: "none", fields: [P("sib_id", "Sibling form id")] },
  { key: "sib-send-sms", group: "siblings", title: "Send sibling SMS", domain: "admission-siblings", method: "get", path: "/admission/sibling-detail/send-sms/{sib_id}", ctx: "none",
    confirm: "Send the sibling-form SMS to the parent now?", fields: [P("sib_id", "Sibling form id")] },
  { key: "det-by-class", group: "siblings", title: "Admission details by class", domain: "admission-siblings", method: "get", path: "/admission/admission-details/all/{class_name}", ...T, fields: [CLASS] },
  { key: "det-paid", group: "siblings", title: "Paid admission details by class", domain: "admission-siblings", method: "get", path: "/admission/admission-details/all-class-wise/{class_name}", ...T, fields: [CLASS] },
  { key: "det-hostel", group: "siblings", title: "Hostel admission details", domain: "admission-siblings", method: "get", path: "/admission/admission-details/hostel", ...T, fields: [] },
  { key: "det-ppr", group: "siblings", title: "PPR admission details", domain: "admission-siblings", method: "get", path: "/admission/admission-details/ppr/{class_name}", ...T, fields: [CLASS] },
  { key: "det-internal", group: "siblings", title: "Internal transfers", domain: "admission-siblings", method: "get", path: "/admission/admission-details/internal-transfer/{class_name}", ...T, fields: [CLASS] },
  { key: "det-selected", group: "siblings", title: "Selected by mobile", domain: "admission-siblings", method: "get", path: "/admission/admission-details/selected/{mobileno}", ...T, fields: [P("mobileno", "Mobile number")] },
  { key: "det-registration", group: "siblings", title: "Admission data by registration", domain: "admission-siblings", method: "get", path: "/admission/admission-details/registration-data/{reg_id}", ctx: "none", fields: [P("reg_id", "Registration id")] },
  { key: "det-detail", group: "siblings", title: "Admission detail", domain: "admission-siblings", method: "get", path: "/admission/admission-details/{detail_id}", ctx: "none", fields: [P("detail_id", "Detail id")] },
  // ---- tally (payment reconciliation reports + CSV imports) ----
  { key: "tally-day", group: "tally", title: "Day report", domain: "admission-tally", method: "get", path: "/admission/tally-report/report/{class_name}/{day}", ...T, fields: [CLASS, P("day", "Day", "date")] },
  { key: "tally-received", group: "tally", title: "Payment received", domain: "admission-tally", method: "post", path: "/admission/tally-report/payment-received", ...T,
    fields: [{ name: "standards", label: "Classes", kind: "lines", required: true, help: "One class per line." }, { name: "start_date", label: "From", kind: "date", required: true }, { name: "end_date", label: "To", kind: "date", required: true }] },
  { key: "tally-csv", group: "tally", title: "Import TPSL CSV", domain: "admission-tally", method: "post", path: "/admission/tally-report/csv", ...T, multipart: true,
    confirm: "Record these payments for reconciliation? Each row is stored with a match status; registrations are not changed.", fields: [{ name: "file", label: "CSV file", kind: "file", required: true, accept: ".csv", help: "Up to 10 MB." }] },
  { key: "tally-razorpay-csv", group: "tally", title: "Import Razorpay CSV", domain: "admission-tally", method: "post", path: "/admission/tally-report/razorpay-csv", ...T, multipart: true,
    confirm: "Record these payments for reconciliation? Each row is stored with a match status; registrations are not changed.", fields: [{ name: "file", label: "CSV file", kind: "file", required: true, accept: ".csv", help: "Up to 10 MB." }] },
]

/** Backend rejects uploads above this with 413. */
export const MAX_CSV_BYTES = 10 * 1024 * 1024

export interface AdmRequest { method: AdmOp["method"]; url: string; params?: Record<string, unknown>; data?: unknown }

/** Values + scope -> request, or per-field errors. Path fields fill the URL; scope fills ctx query params. */
export function buildAdmRequest(op: AdmOp, values: Record<string, unknown>, scope: { branch_id?: string; academic_year_id?: string }):
  { req: AdmRequest; errors?: undefined } | { req?: undefined; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const query: Record<string, unknown> = {}
  if (op.ctx === "both") {
    if (!scope.branch_id) errors.branch_id = "Select a branch"
    else query.branch_id = scope.branch_id
  }
  if (op.ctx !== "none") {
    if (!scope.academic_year_id) errors.academic_year_id = "Select an academic year"
    else query.academic_year_id = scope.academic_year_id
  }
  let url = op.path
  for (const f of op.fields.filter((x) => x.pathParam)) {
    const v = String(values[f.name] ?? "").trim()
    if (!v) errors[f.name] = `${f.label} is required`
    else url = url.replace(`{${f.name}}`, encodeURIComponent(v))
  }
  const { body, errors: fe } = buildPayload(op.fields.filter((x) => !x.pathParam), values)
  Object.assign(errors, fe)
  const file = values.file as { size?: number; name?: string } | undefined
  if (op.multipart && file && !errors.file) {
    if (typeof file.size === "number" && file.size > MAX_CSV_BYTES) errors.file = "File is larger than 10 MB. Split the CSV and import it in parts."
    else if (file.name && !/\.csv$/i.test(file.name)) errors.file = "Choose a .csv file"
  }
  if (Object.keys(errors).length) return { errors }
  if (op.method === "get" || op.method === "delete") return { req: { method: op.method, url, params: { ...query, ...body } } }
  return { req: { method: op.method, url, params: query, data: op.bodyList ? body[op.bodyList] : body } }
}

export interface Recipient { registration_id: string; mobileno?: string; email?: string }

/** sms-email rows -> send-sms-email body. Contacts are re-read server side, so only ids are trusted. */
export function buildSendPayload(kind: "SMS" | "Email", text: string, subject: string, rows: Record<string, unknown>[]):
  { body?: { type: string; text: string; subject?: string; students: Recipient[] }; error?: string } {
  const t = text.trim()
  if (!t) return { error: "Message is required" }
  const students = rows.filter((r) => typeof r.id === "string" && r.id).map((r) => ({ registration_id: r.id as string, ...(typeof r.mobileno === "string" && r.mobileno ? { mobileno: r.mobileno } : {}) }))
  if (!students.length) return { error: "No recipients" }
  return { body: { type: kind, text: t, ...(kind === "Email" && subject.trim() ? { subject: subject.trim() } : {}), students } }
}
