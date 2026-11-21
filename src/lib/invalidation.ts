import type { QueryClient } from "@tanstack/react-query"

import { qk, type QueryDomain } from "./query-keys"

// When a mutation changes <domain>, these dependent domains are stale too.
export const DEPENDENTS: Partial<Record<QueryDomain, QueryDomain[]>> = {
  students: ["dashboard-summary", "enrollments", "section-attendance-summary"],
  enrollments: ["students", "dashboard-summary", "section-attendance-summary"],
  sections: ["students", "timetable-entries"],
  "student-attendance": ["section-attendance-summary", "dashboard-summary", "portal"],
  "staff-attendance": ["dashboard-summary"],
  invoices: ["dashboard-summary", "portal"],
  branches: ["dashboard-summary"],
  "academic-years": ["enrollments", "sections", "dashboard-summary"],
  notices: ["notifications"],
  "leave-types": ["staff-grades", "leave-balances"],
  "staff-grades": ["employee-master", "leave-balances"],
  "teacher-assignment": ["sections", "house-teachers", "standard-teachers"],
}

export function domainsToInvalidate(domain: QueryDomain): QueryDomain[] {
  return [domain, ...(DEPENDENTS[domain] ?? [])]
}

export function invalidateWithDependents(client: QueryClient, domain: QueryDomain) {
  return Promise.all(domainsToInvalidate(domain).map((d) => client.invalidateQueries({ queryKey: qk(d) })))
}
