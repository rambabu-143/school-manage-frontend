// Pub/sub for "who/where the user is acting as just changed" (branch / year
// switch, impersonation start or exit). The only subscriber is the query-cache
// owner (attachIdentityGuard in identity-lifecycle.ts), which purges the cache
// via purgeOtherScopes; callers just announce the change.

type Listener = () => void

const listeners = new Set<Listener>()

export function subscribeIdentityChange(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function onIdentityChange(): void {
  listeners.forEach((listener) => listener())
}
