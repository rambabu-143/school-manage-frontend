import type { QueryClient } from "@tanstack/react-query"

import { SESSION_CONTEXT_KEY, SESSION_KEY, scopeKey, setQueryScope, type QueryScope } from "./query-keys"

type UserLike = { id: string; tenant_id: string } | null | undefined

export function userToScope(user: UserLike, ctx?: Pick<QueryScope, "branchId" | "academicYearId">): QueryScope | null {
  return user ? { userId: user.id, tenantId: user.tenant_id, ...ctx } : null
}

const same = (a?: string | null, b?: string | null) => (a ?? null) === (b ?? null)
/** Same user + tenant, and each of branch / year is unchanged or only filled in (or cleared by a failure). */
function isRefinement(a: QueryScope, b: QueryScope) {
  if (a.userId !== b.userId || a.tenantId !== b.tenantId) return false
  const ok = (x?: string | null, y?: string | null) => same(x, y) || x == null || y == null
  return ok(a.branchId, b.branchId) && ok(a.academicYearId, b.academicYearId)
}

/** /auth/session result -> context to keep. Only a 401 clears it; transient failures keep the previous one. */
export function nextSessionContext<T>(prev: T, status: number, body: T | undefined): T | null {
  if (status === 401) return null
  return status >= 200 && status < 300 && body !== undefined ? body : prev
}

/** Cancel in-flight work and drop every cached query that is not the session itself. */
export function purgeOtherScopes(client: QueryClient, keep: string | null) {
  const predicate = (q: { queryKey: readonly unknown[] }) =>
    q.queryKey[0] !== SESSION_KEY[0] && q.queryKey[0] !== SESSION_CONTEXT_KEY[0] && q.queryKey[0] !== keep
  void client.cancelQueries({ predicate })
  client.removeQueries({ predicate })
}

/**
 * Tracks which identity owns the cache. Call sync() whenever the session user
 * or active branch / academic year changes (login, logout, switch, refetched
 * session). Returns true when the cache was purged.
 */
export function createIdentityGuard(client: QueryClient) {
  let owner: string | null = null
  let ownerScope: QueryScope | null = null
  return {
    owner: () => owner,
    sync(scope: QueryScope | null): boolean {
      const next = scope ? scopeKey(scope) : null
      if (scope && ownerScope && isRefinement(ownerScope, scope)) {
        // Same user, branch / year went unknown -> known (or a context fetch
        // failed and is unknown again): keep the applied scope so the app does
        // not purge and remount over unsaved UI state.
        if (scope.branchId != null || scope.academicYearId != null) ownerScope = scope
        owner = scopeKey(ownerScope)
        return false
      }
      setQueryScope(scope)
      ownerScope = scope
      if (next === owner) return false
      const hadOwner = owner !== null
      owner = next
      // First identity claiming an empty cache needs no purge; anything else does.
      if (!hadOwner && next !== null) return false
      purgeOtherScopes(client, next)
      return true
    },
  }
}

type Ctx = { branch_id?: string | null; academic_year_id?: string | null } | null | undefined

export function ctxToScopeCtx(ctx: Ctx) {
  return { branchId: ctx?.branch_id ?? null, academicYearId: ctx?.academic_year_id ?? null }
}

/**
 * Wire the guard to the session query so any session change re-scopes the cache.
 * Branch / academic year come from the SESSION_CONTEXT_KEY entry that useSession
 * writes just before the session user. subscribeIdentity (session-events) refetches
 * the session when a branch / year switch or impersonation happens.
 */
export function attachIdentityGuard(client: QueryClient, subscribeIdentity?: (cb: () => void) => () => void) {
  const guard = createIdentityGuard(client)
  client.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.query.queryKey[0] === SESSION_KEY[0] && event.action.type === "success") {
      const ctx = client.getQueryData(SESSION_CONTEXT_KEY) as Ctx
      guard.sync(userToScope(event.query.state.data as UserLike, ctxToScopeCtx(ctx)))
    }
  })
  // Explicit identity change (branch / year switch, impersonation start or exit):
  // drop every cached query now, then refetch the session so the guard re-scopes.
  subscribeIdentity?.(() => {
    purgeOtherScopes(client, null)
    void client.invalidateQueries({ queryKey: SESSION_KEY })
  })
  return guard
}
