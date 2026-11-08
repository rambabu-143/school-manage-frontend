// Single hook point for "who/where the user is acting as just changed"
// (branch switch, academic-year switch, impersonation start/exit, login via
// another method). The query-cache owner subscribes once and clears or
// invalidates caches; the auth hooks only call onIdentityChange().

type Listener = () => void

const listeners = new Set<Listener>()

export function subscribeIdentityChange(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Returns true if anyone handled it, so callers can fall back to their own clearing. */
export function onIdentityChange(): boolean {
  listeners.forEach((listener) => listener())
  return listeners.size > 0
}
