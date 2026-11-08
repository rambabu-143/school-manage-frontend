import type { QueryClient } from "@tanstack/react-query"

import { SESSION_CONTEXT_KEY, SESSION_KEY, scopeKey, setQueryScope, type QueryScope } from "./query-keys"

type UserLike = { id: string; tenant_id: string } | null | undefined

export function userToScope(user: UserLike, ctx?: Pick<QueryScope, "branchId" | "academicYearId">): QueryScope | null {
  return user ? { userId: user.id, tenantId: user.tenant_id, ...ctx } : null
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
  return {
    owner: () => owner,
    sync(scope: QueryScope | null): boolean {
      const next = scope ? scopeKey(scope) : null
      setQueryScope(scope)
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
  subscribeIdentity?.(() => void client.invalidateQueries({ queryKey: SESSION_KEY }))
  return guard
}
