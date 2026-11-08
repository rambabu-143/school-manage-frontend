import type { QueryClient } from "@tanstack/react-query"

import { SESSION_KEY, scopeKey, setQueryScope, type QueryScope } from "./query-keys"

type UserLike = { id: string; tenant_id: string } | null | undefined

export function userToScope(user: UserLike, ctx?: Pick<QueryScope, "branchId" | "academicYearId">): QueryScope | null {
  return user ? { userId: user.id, tenantId: user.tenant_id, ...ctx } : null
}

/** Cancel in-flight work and drop every cached query that is not the session itself. */
export function purgeOtherScopes(client: QueryClient, keep: string | null) {
  const predicate = (q: { queryKey: readonly unknown[] }) =>
    q.queryKey[0] !== SESSION_KEY[0] && q.queryKey[0] !== keep
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

/** Wire the guard to the session query so any session change re-scopes the cache. */
export function attachIdentityGuard(client: QueryClient, ctx?: () => Pick<QueryScope, "branchId" | "academicYearId">) {
  const guard = createIdentityGuard(client)
  client.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.query.queryKey[0] === SESSION_KEY[0] && event.action.type === "success") {
      guard.sync(userToScope(event.query.state.data as UserLike, ctx?.()))
    }
  })
  return guard
}
