import type { ActionFormCfg, Field, Report, Resource } from "./types"

const BRANCH: Field = { name: "branch_id", label: "Branch", kind: "branch", required: true, scoped: true, createOnly: true }
const YEAR: Field = { name: "academic_year_id", label: "Academic year", kind: "year", required: true, scoped: true, createOnly: true }
const DATE_RANGE = (extra = ""): Field[] => [
  { name: "start_date", label: `Start date${extra}`, kind: "date", required: true },
  { name: "start_time", label: "Start time", kind: "time", required: true },
  { name: "end_date", label: "End date", kind: "date", required: true },
  { name: "end_time", label: "End time", kind: "time", required: true },
  { name: "remark", label: "Remark", kind: "textarea" },
]
const GOLIVE_COLS = [
  { key: "start_date", label: "Start date" }, { key: "start_time", label: "Start" },
  { key: "end_date", label: "End date" }, { key: "end_time", label: "End" }, { key: "remark", label: "Remark" },
]

export const RESOURCES = {
  // ---- inventory extras ----
  units: {
    key: "units", title: "Product units", noun: "unit", list: "/product-units", create: "/product-units", item: "/product-units/{id}",
    columns: [{ key: "name", label: "Name" }, { key: "sort_order", label: "Order" }],
    fields: [{ name: "name", label: "Name", required: true }, { name: "sort_order", label: "Sort order", kind: "number" }],
  },
  variants: {
    key: "variants", title: "Product variants", noun: "variant", list: "/product-variants", create: "/product-variants", item: "/product-variants/{id}",
    filters: [{ name: "product_id", label: "Product", kind: "product" }],
    columns: [{ key: "variant_name", label: "Variant" }, { key: "brand", label: "Brand" }, { key: "size", label: "Size" }, { key: "color", label: "Colour" }, { key: "current_stock", label: "Stock" }, { key: "is_active", label: "Active", kind: "bool" }],
    fields: [
      { name: "product_id", label: "Product", kind: "product", required: true, createOnly: true },
      { name: "variant_name", label: "Variant name", required: true },
      { name: "type", label: "Type" }, { name: "color", label: "Colour" }, { name: "width", label: "Width" },
      { name: "length", label: "Length" }, { name: "size", label: "Size" }, { name: "brand", label: "Brand" },
      { name: "current_stock", label: "Current stock" },
      { name: "is_default", label: "Default variant", kind: "bool" }, { name: "is_active", label: "Active", kind: "bool" },
    ],
  },
  requisitionRoles: {
    key: "requisition-roles", title: "Requisition roles", noun: "role", scope: "branch", list: "/requisition-roles", create: "/requisition-roles", item: "/requisition-roles/{id}",
    columns: [{ key: "name", label: "Name" }, { key: "short_name", label: "Short name" }, { key: "sort_order", label: "Order" }],
    fields: [BRANCH, { name: "name", label: "Name", required: true }, { name: "short_name", label: "Short name", required: true }, { name: "sort_order", label: "Sort order", kind: "number", required: true }],
  },
  approvers: {
    key: "requisition-approvers", title: "Requisition approvers", noun: "approver", list: "/requisition-approvers", item: "/requisition-approvers/{id}", idKey: "requester_user_id", upsert: true, create: undefined,
    columns: [{ key: "requester_user_id", label: "Requester", kind: "short" }, { key: "approver_user_id", label: "Approver", kind: "short" }],
    fields: [
      { name: "requester_user_id", label: "Requester", kind: "user", required: true, createOnly: true, pathParam: true },
      { name: "approver_user_id", label: "Approver", kind: "user", required: true },
    ],
  },
  // ---- transport ----
  renewalSettings: {
    key: "transport-renewal-settings", title: "Transport renewal settings", noun: "setting", scope: "branch+year", list: "/transport-renewal-settings/all", create: "/transport-renewal-settings", item: "/transport-renewal-settings/{id}",
    columns: [{ key: "deadline_date", label: "Deadline" }, { key: "start_date", label: "Start date" }, { key: "start_time", label: "Start" }, { key: "end_time", label: "End" }, { key: "remark", label: "Remark" }],
    fields: [BRANCH, YEAR, { name: "deadline_date", label: "Deadline", kind: "date", required: true }, { name: "start_date", label: "Start date", kind: "date" }, { name: "start_time", label: "Start time", kind: "time" }, { name: "end_time", label: "End time", kind: "time" }, { name: "remark", label: "Remark", kind: "textarea" }],
  },
  transportRequests: {
    key: "transport-requests", title: "Transport requests", noun: "request", list: "/transport-requests", create: "/transport-requests", noUpdate: true, noDelete: true,
    filters: [{ name: "status", label: "Status", kind: "select", options: ["pending", "approved", "rejected"] }],
    columns: [{ key: "student_id", label: "Student", kind: "short" }, { key: "requested_route_id", label: "Route", kind: "short" }, { key: "requested_stop_id", label: "Stop", kind: "short" }, { key: "reason", label: "Reason" }, { key: "status", label: "Status" }, { key: "created_at", label: "Requested", kind: "datetime" }],
    fields: [
      { name: "student_id", label: "Student", kind: "student", required: true },
      { name: "requested_route_id", label: "Route", kind: "route", required: true },
      { name: "requested_stop_id", label: "Stop", kind: "stop", routeField: "requested_route_id", required: true },
      { name: "reason", label: "Reason", kind: "textarea" },
    ],
    actions: [
      { label: "Approve", method: "post", path: "/transport-requests/{id}/approve", when: { key: "status", equals: "pending" } },
      { label: "Reject", method: "post", path: "/transport-requests/{id}/reject", when: { key: "status", equals: "pending" } },
    ],
  },
  // ---- rooms ----
  blocks: {
    key: "school-blocks", title: "School blocks", noun: "block", scope: "branch", list: "/school-blocks", create: "/school-blocks", item: "/school-blocks/{id}",
    columns: [{ key: "name", label: "Name" }, { key: "no_of_floors", label: "Floors" }],
    fields: [BRANCH, { name: "name", label: "Name", required: true }, { name: "no_of_floors", label: "Number of floors", kind: "number", required: true }],
  },
  // ---- id cards ----
  idCardRequests: {
    key: "id-card-requests", title: "ID card update requests", noun: "request", list: "/id-card-requests", noUpdate: true, noDelete: true,
    filters: [{ name: "status", label: "Status", kind: "select", options: ["pending", "resolved"] }],
    columns: [{ key: "student_id", label: "Student", kind: "short" }, { key: "status", label: "Status" }, { key: "created_at", label: "Requested", kind: "datetime" }],
    fields: [],
    actions: [{ label: "Resolve", method: "put", path: "/id-card-requests/{id}/resolve", when: { key: "status", equals: "pending" } }],
  },
  // ---- events ----
  eventUsers: {
    key: "event-users", title: "Event users", noun: "event user", scope: "branch+year", scopeRequired: true, list: "/event-users", create: "/event-users", item: "/event-users/{id}",
    columns: [{ key: "name", label: "Name" }, { key: "code", label: "Code" }, { key: "email", label: "Email" }, { key: "type", label: "Type" }, { key: "is_active", label: "Active", kind: "bool" }],
    fields: [
      BRANCH, YEAR,
      { name: "name", label: "Name", required: true }, { name: "code", label: "Code", required: true },
      { name: "email", label: "Email", kind: "email", required: true }, { name: "mobile", label: "Mobile" },
      { name: "type", label: "Type", kind: "select", options: ["CARMELIAN", "INTERACT"], required: true },
      { name: "password", label: "Password", kind: "password", required: true, optionalOnEdit: true, help: "On edit, leave blank to keep the current password." },
      { name: "is_active", label: "Active", kind: "bool", editOnly: true },
    ],
  },
  eventEmailSettings: {
    key: "event-email-settings", title: "Event email settings", noun: "email setting", scope: "branch+year", scopeRequired: true, list: "/event-email-settings", create: "/event-email-settings", item: "/event-email-settings/{id}", noDelete: true,
    columns: [{ key: "email", label: "Sender email" }, { key: "from_name", label: "From name" }, { key: "file_name", label: "Attachment" }, { key: "updated_at", label: "Updated", kind: "datetime" }],
    fields: [BRANCH, YEAR, { name: "email", label: "Sender email", kind: "email", required: true }, { name: "app_password", label: "App password", kind: "password", required: true, optionalOnEdit: true }, { name: "from_name", label: "From name" }, { name: "file_name", label: "Attachment file name", editOnly: true }],
  },
  eventSiteFiles: {
    key: "event-site-files", title: "Event site files", noun: "site file", scope: "branch+year", scopeRequired: true, list: "/event-site-files", create: "/event-site-files", item: "/event-site-files/{id}", noUpdate: true,
    filters: [{ name: "file_type", label: "File type", kind: "select", options: ["photo", "document"], required: true }],
    columns: [{ key: "file_type", label: "Type" }, { key: "file_name", label: "File name" }, { key: "created_at", label: "Added", kind: "datetime" }],
    fields: [BRANCH, YEAR, { name: "file_type", label: "File type", kind: "select", options: ["photo", "document"], required: true }, { name: "file_name", label: "File name", required: true }],
  },
  eventRegistrations: {
    key: "event-registrations", title: "Event registrations", noun: "registration", scope: "branch", scopeRequired: true, list: "/events/participants", noUpdate: true, noDelete: true,
    columns: [{ key: "event_id", label: "Event", kind: "short" }, { key: "student_id", label: "Student", kind: "short" }, { key: "registered_at", label: "Registered", kind: "datetime" }],
    fields: [],
  },
  // ---- go-live windows ----
  clubGolive: {
    key: "club-golive", title: "Club go-live", noun: "window", scope: "branch+year", list: "/club-golive", create: "/club-golive", item: "/club-golive/{id}",
    columns: GOLIVE_COLS, fields: [BRANCH, YEAR, ...DATE_RANGE()],
  },
  selfAwarenessGolive: {
    key: "self-awareness-golive", title: "Self-awareness go-live", noun: "window", scope: "branch+year", list: "/self-awareness/golive", create: "/self-awareness/golive", item: "/self-awareness/golive/{id}",
    columns: [{ key: "type", label: "Type" }, ...GOLIVE_COLS],
    fields: [
      BRANCH, YEAR, { name: "type", label: "Type", required: true, help: "Form type this window opens." },
      ...DATE_RANGE(),
      { name: "section_ids", label: "Sections (optional)", kind: "multi", ref: "section" },
      { name: "student_ids", label: "Students (optional)", kind: "multi", ref: "student" },
    ],
  },
  streamSettings: {
    key: "stream-settings", title: "Stream selection windows", noun: "window", scope: "branch+year", list: "/stream-settings", create: "/stream-settings", item: "/stream-settings/{id}",
    columns: [{ key: "section_id", label: "Section", kind: "short" }, { key: "window_start", label: "Opens", kind: "datetime" }, { key: "window_end", label: "Closes", kind: "datetime" }, { key: "remark", label: "Remark" }],
    fields: [{ name: "section_id", label: "Section", kind: "section", required: true, createOnly: true }, { name: "window_start", label: "Opens", kind: "datetime", required: true }, { name: "window_end", label: "Closes", kind: "datetime", required: true }, { name: "remark", label: "Remark", kind: "textarea" }],
  },
  nominationSettings: {
    key: "self-nomination-settings", title: "Self-nomination settings", noun: "setting", scope: "branch+year", list: "/self-nomination-settings/all", create: "/self-nomination-settings", item: "/self-nomination-settings/{id}",
    columns: [{ key: "form_type", label: "Form" }, { key: "window_start", label: "Opens", kind: "datetime" }, { key: "window_end", label: "Closes", kind: "datetime" }],
    fields: [BRANCH, YEAR, { name: "form_type", label: "Form type", kind: "select", options: ["junior", "senior"], required: true, createOnly: true }, { name: "window_start", label: "Opens", kind: "datetime" }, { name: "window_end", label: "Closes", kind: "datetime" }],
  },
  // ---- syllabus / nomination files ----
  syllabusDocs: {
    key: "syllabus-documents", title: "Syllabus documents", noun: "document", list: "/syllabus-documents", item: "/syllabus-documents/{id}",
    columns: [{ key: "name", label: "Name" }, { key: "grade_id", label: "Grade", kind: "short" }, { key: "created_at", label: "Uploaded", kind: "datetime" }],
    fields: [], downloads: [{ label: "Download", path: "/syllabus-documents/{id}/download", fallbackName: "syllabus" }],
  },
  nominationFiles: {
    key: "self-nomination-files", title: "Self-nomination files", noun: "file", scope: "branch+year", list: "/self-nomination-files", noUpdate: true, noDelete: true,
    columns: [{ key: "grade_id", label: "Grade", kind: "short" }, { key: "created_at", label: "Uploaded", kind: "datetime" }], fields: [],
  },
  // ---- shooting ----
  shootingSlots: {
    key: "shooting-slots", title: "Shooting slots", noun: "slot", scope: "branch+year", scopeRequired: true, list: "/shooting-slots", create: "/shooting-slots", item: "/shooting-slots/{id}",
    columns: [{ key: "slot_name", label: "Slot" }, { key: "start_time", label: "Start" }, { key: "end_time", label: "End" }, { key: "remark", label: "Remark" }],
    fields: [BRANCH, YEAR, { name: "slot_name", label: "Slot name", required: true }, { name: "start_time", label: "Start time", kind: "time", required: true }, { name: "end_time", label: "End time", kind: "time", required: true }, { name: "annual_fee", label: "Annual fee", kind: "number", required: true, help: "Required by the API; fee collection itself is out of scope." }, { name: "remark", label: "Remark", kind: "textarea", required: true }],
  },
  shootingApplications: {
    key: "shooting-applications", title: "Shooting applications", noun: "application", scope: "branch+year", scopeRequired: true, list: "/shooting-applications", create: "/shooting-applications", item: "/shooting-applications/{id}",
    columns: [{ key: "student_id", label: "Student", kind: "short" }, { key: "prior_experience", label: "Prior experience" }, { key: "slots", label: "Slots" }],
    fields: [
      BRANCH, YEAR,
      { name: "student_id", label: "Student", kind: "student", required: true, createOnly: true },
      { name: "slots", label: "Slot ids", kind: "lines", required: true, help: "One slot id per line (see the Slots tab)." },
      { name: "prior_experience", label: "Prior experience", kind: "textarea", required: true },
      { name: "terms1", label: "Terms 1 accepted", kind: "bool" }, { name: "terms2", label: "Terms 2 accepted", kind: "bool" },
    ],
  },
  shootingGolive: {
    key: "shooting-golive", title: "Class go-live", noun: "window", scope: "branch+year", scopeRequired: true, list: "/shooting-golive", create: "/shooting-golive", item: "/shooting-golive/{id}",
    columns: [{ key: "grade_id", label: "Grade", kind: "short" }, ...GOLIVE_COLS],
    fields: [BRANCH, YEAR, { name: "grade_id", label: "Grade", kind: "grade", required: true, createOnly: true }, ...DATE_RANGE()],
  },
  shootingStudentGolive: {
    key: "shooting-student-golive", title: "Student go-live", noun: "window", scope: "branch+year", scopeRequired: true, list: "/shooting-student-golive", create: "/shooting-student-golive", item: "/shooting-student-golive/{id}",
    columns: [{ key: "student_id", label: "Student", kind: "short" }, ...GOLIVE_COLS],
    fields: [BRANCH, YEAR, { name: "students", label: "Students", kind: "multi", ref: "student", required: true, createOnly: true }, ...DATE_RANGE()],
  },
} satisfies Record<string, Resource>

const DATES: Field[] = [{ name: "date_from", label: "From", kind: "date" }, { name: "date_to", label: "To", kind: "date" }]
const PRODUCT: Field = { name: "product_id", label: "Product", kind: "product" }

export const INVENTORY_REPORTS: Report[] = [
  { key: "consumption", title: "Consumption", method: "get", path: "/inventory/reports/consumption", fields: [PRODUCT, ...DATES] },
  { key: "category", title: "By category", method: "get", path: "/inventory/reports/category", fields: [PRODUCT, ...DATES] },
  { key: "department", title: "By department", method: "get", path: "/inventory/reports/department", fields: [PRODUCT, { name: "department_id", label: "Department", kind: "department" }, ...DATES] },
  { key: "transactions", title: "Transactions", method: "get", path: "/inventory/reports/transactions", flatten: "transactions", fields: [PRODUCT, ...DATES] },
]

export const STOCK_IN: ActionFormCfg = {
  key: "stock-in", title: "Record stock in", method: "post", path: "/inventory/reports/stock-in", submit: "Add stock",
  fields: [{ name: "product_id", label: "Product", kind: "product", required: true }, { name: "quantity", label: "Quantity", kind: "number", required: true }, { name: "remarks", label: "Remarks" }],
}

export const TRANSPORT_REPORTS: Report[] = [
  { key: "forms", title: "Renewal forms", method: "get", path: "/transport-renewal-forms", scope: "branch+year", fields: [{ name: "branch_id", label: "Branch", kind: "branch", scoped: true }, { name: "academic_year_id", label: "Year", kind: "year", scoped: true }, { name: "transport_type", label: "Transport type" }] },
  { key: "interests", title: "Interest report", method: "post", path: "/transport-interests/report", scope: "branch+year", fields: [{ name: "branch_id", label: "Branch", kind: "branch", required: true, scoped: true }, { name: "academic_year_id", label: "Year", kind: "year", required: true, scoped: true }, { name: "is_interested", label: "Interested", kind: "bool" }, { name: "section_ids", label: "Sections", kind: "multi", ref: "section" }] },
  { key: "students", title: "Student transport", method: "get", path: "/student-transports", fields: [{ name: "search", label: "Search" }, { name: "route_id", label: "Route", kind: "route" }] },
]

export const RENEWAL_NOTIFY: ActionFormCfg = {
  key: "renewal-notify", title: "Notify sections to fill renewal forms", method: "post", path: "/transport-renewal-forms/notify", scope: "branch+year", submit: "Send notifications",
  fields: [{ name: "academic_year_id", label: "Year", kind: "year", required: true, scoped: true }, { name: "section_ids", label: "Sections", kind: "multi", ref: "section", required: true }],
}

export const ID_CARD_REPORT: Report[] = [
  { key: "section", title: "Update requests by section", method: "get", path: "/id-card-requests/report/{section_id}", fields: [{ name: "section_id", label: "Section", kind: "section", required: true, pathParam: true }] },
]

export const EVENT_MAIL: ActionFormCfg = {
  key: "event-mail", title: "Send email to participants", method: "post", path: "/event-email-settings/send", scope: "branch+year", submit: "Send",
  fields: [
    { name: "branch_id", label: "Branch", kind: "branch", required: true, scoped: true }, { name: "academic_year_id", label: "Year", kind: "year", required: true, scoped: true },
    { name: "emails", label: "Recipients", kind: "lines", required: true, help: "One address per line." },
    { name: "subject", label: "Subject", required: true }, { name: "content", label: "Message", kind: "textarea" },
  ],
}

export const SYLLABUS_UPLOAD: ActionFormCfg = {
  key: "syllabus-upload", title: "Upload syllabus document", method: "post", path: "/syllabus-documents", multipart: true, submit: "Upload",
  fields: [
    { name: "file", label: "File", kind: "file", required: true }, { name: "name", label: "Name", required: true },
    { name: "academic_year_id", label: "Academic year", kind: "year", required: true }, { name: "grade_id", label: "Grade", kind: "grade" },
  ],
}

export const NOMINATION_UPLOAD: ActionFormCfg = {
  key: "nomination-upload", title: "Upload guideline and schedule", method: "post", path: "/self-nomination-files", multipart: true, scope: "branch+year", submit: "Upload",
  fields: [
    { name: "branch_id", label: "Branch", kind: "branch", required: true, scoped: true }, { name: "academic_year_id", label: "Year", kind: "year", required: true, scoped: true },
    { name: "grade_id", label: "Grade", kind: "grade", required: true },
    { name: "guideline", label: "Guideline file", kind: "file", required: true }, { name: "schedule", label: "Schedule file", kind: "file", required: true },
  ],
}

export const SHOOTING_CLASSWISE: Report[] = [
  { key: "golive", title: "Class-wise go-live", method: "get", path: "/shooting-golive/class-wise/{grade_id}", scope: "branch+year", fields: [{ name: "grade_id", label: "Grade", kind: "grade", required: true, pathParam: true }, { name: "branch_id", label: "Branch", kind: "branch", scoped: true }, { name: "academic_year_id", label: "Year", kind: "year", scoped: true }] },
  { key: "student", title: "Class-wise student go-live", method: "get", path: "/shooting-student-golive/class-wise/{grade_id}", scope: "branch+year", fields: [{ name: "grade_id", label: "Grade", kind: "grade", required: true, pathParam: true }, { name: "branch_id", label: "Branch", kind: "branch", scoped: true }, { name: "academic_year_id", label: "Year", kind: "year", scoped: true }] },
]

export const SECTION_CERTIFICATES = [
  { label: "Provisional certificates", path: "/section-certificates/{section_id}/provisional" },
  { label: "Co-scholastic certificates", path: "/section-certificates/{section_id}/co-scholastic" },
  { label: "Registration certificates", path: "/section-certificates/{section_id}/registration" },
] as const
