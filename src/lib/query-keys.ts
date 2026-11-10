// Identity-scoped, typed query keys. Every key is [scope, domain, ...parts]
// where scope = user + tenant (+ active branch / academic year), so cached
// data can never be served to a different identity or context. Pure module
// (no React) so it is unit-testable and usable from the QueryCache.

export type QueryDomain =
  | "academic-years"
  | "alumni"
  | "applications"
  | "appraisal-assignments"
  | "appraisal-cycles"
  | "assets"
  | "board-of-directors"
  | "branches"
  | "cca-activities"
  | "cca-indicators"
  | "cca-report-card"
  | "certificates"
  | "club-memberships"
  | "clubs"
  | "combos"
  | "concession-renewals"
  | "concessions"
  | "counselling-followups"
  | "counselling-records"
  | "cumulative-report"
  | "dashboard-summary"
  | "datesheet-entries"
  | "departments"
  | "disciplinary-records"
  | "documents"
  | "email-config"
  | "emails"
  | "enquiries"
  | "enrollments"
  | "event-participants"
  | "event-photos"
  | "event-scores"
  | "events"
  | "exams"
  | "fee-heads"
  | "gallery-albums"
  | "grades"
  | "holidays"
  | "homework"
  | "hostel-rooms"
  | "hostels"
  | "house-leaderboard"
  | "house-points"
  | "houses"
  | "id-card"
  | "id-card-requests"
  | "invoices"
  | "leave-applications"
  | "marks"
  | "master-data"
  | "message-groups"
  | "message-templates"
  | "module-settings"
  | "newsletters"
  | "nomination-reviews"
  | "notices"
  | "notifications"
  | "observation-remarks"
  | "payment-gateway-config"
  | "payments"
  | "periods"
  | "portal"
  | "product-categories"
  | "products"
  | "purchase-orders"
  | "report-card"
  | "report-card-release-setting"
  | "requisitions"
  | "rooms"
  | "section-attendance-summary"
  | "section-syllabus-coverage"
  | "sections"
  | "self-awareness-forms"
  | "self-nominations"
  | "shifts"
  | "sms-config"
  | "sms-messages"
  | "staff"
  | "staff-appraisals"
  | "staff-attendance"
  | "staff-ratings"
  | "stream-combinations"
  | "stream-selections"
  | "streams"
  | "student-attendance"
  | "student-combo"
  | "student-hostel"
  | "student-house"
  | "student-transport"
  | "students"
  | "subjects"
  | "syllabus-topics"
  | "tenant-users"
  | "timetable-entries"
  | "transport-routes"
  | "transport-slabs"
  | "transport-stops"
  | "vendors"
  | "app-settings"
  | "app-uploads"
  | "app-versions"
  | "ar-settings"
  | "board-results"
  | "calendar-settings"
  | "module-access"
  | "transport-renewal"
  | "birthday-wishes"

export type QueryScope = {
  userId: string
  tenantId: string
  branchId?: string | null
  academicYearId?: string | null
}

export const ANON_SCOPE_KEY = "anon"
/** Session is the one key that exists before an identity is known. */
export const SESSION_KEY = ["session"] as const
/** Active branch / academic year from /auth/session; written alongside the session user. */
export const SESSION_CONTEXT_KEY = ["session-context"] as const

export function scopeKey(scope: QueryScope | null): string {
  if (!scope) return ANON_SCOPE_KEY
  return [scope.tenantId, scope.userId, scope.branchId ?? "-", scope.academicYearId ?? "-"].join("|")
}

let current: QueryScope | null = null
const listeners = new Set<() => void>()

export const getQueryScope = () => current
export const getScopeKey = () => scopeKey(current)
/** For useSyncExternalStore: lets mounted trees re-key when the scope changes. */
export const subscribeQueryScope = (cb: () => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
export const setQueryScope = (scope: QueryScope | null) => {
  const changed = scopeKey(scope) !== scopeKey(current)
  current = scope
  if (changed) listeners.forEach((cb) => cb())
}

/** qk("students", { page }) -> [scope, "students", { page }] ; partial keys work for invalidation. */
export function qk(domain: QueryDomain, ...parts: unknown[]) {
  return [scopeKey(current), domain, ...parts] as const
}
