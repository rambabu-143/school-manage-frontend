import { QueryClient, type Query } from "@tanstack/react-query"

import { SESSION_KEY, type QueryDomain } from "./query-keys"

// Per-domain freshness. Anything not listed is a "list" (30 s).
const SEC = 1000
const REFERENCE: QueryDomain[] = [
  "academic-years", "branches", "departments", "grades", "streams", "subjects", "sections",
  "periods", "shifts", "fee-heads", "holidays", "houses", "master-data", "module-settings",
  "tenant-users", "rooms", "hostels", "hostel-rooms", "transport-routes", "transport-slabs",
  "transport-stops", "product-categories", "combos", "stream-combinations", "message-templates",
  "email-config", "sms-config", "payment-gateway-config", "cca-indicators", "clubs",
]
const DASHBOARDS: QueryDomain[] = [
  "dashboard-summary", "house-leaderboard", "section-attendance-summary", "section-syllabus-coverage",
  "cumulative-report", "portal",
]
const LIVE: QueryDomain[] = [
  "student-attendance", "staff-attendance", "notifications", "emails", "sms-messages",
]

export const FRESHNESS_MS = { reference: 5 * 60 * SEC, list: 30 * SEC, dashboard: 20 * SEC, live: 5 * SEC } as const

export function staleTimeFor(domain: unknown): number {
  if (domain === SESSION_KEY[0]) return 5 * 60 * SEC
  if (REFERENCE.includes(domain as QueryDomain)) return FRESHNESS_MS.reference
  if (DASHBOARDS.includes(domain as QueryDomain)) return FRESHNESS_MS.dashboard
  if (LIVE.includes(domain as QueryDomain)) return FRESHNESS_MS.live
  return FRESHNESS_MS.list
}

/** Applied as the QueryClient default: key shape is [scope, domain, ...] (or ["session"]). */
export function staleTimeForQuery(query: Query): number {
  const k = query.queryKey
  return staleTimeFor(k[0] === SESSION_KEY[0] ? k[0] : k[1])
}

const NO_RETRY = new Set([401, 403, 404, 422])

export function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status
  if (status !== undefined && NO_RETRY.has(status)) return false
  return failureCount < 1
}

/** Polling interval: paused when the tab is hidden, exponential backoff on errors (cap 8x). */
export function pollInterval(baseMs: number, failureCount: number, hidden: boolean): number | false {
  if (hidden) return false
  return baseMs * 2 ** Math.min(failureCount, 3)
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: staleTimeForQuery, retry: shouldRetry } },
  })
}
