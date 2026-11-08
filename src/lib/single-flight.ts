/**
 * Share one promise per key. Successful results are kept for ttlMs because
 * backend refresh tokens are single-use: a request still carrying the old
 * refresh cookie must get the already-rotated pair, not a 401.
 * Per-process only: multi-instance deployments need sticky sessions or a shared store.
 */
const inflight = new Map<string, Promise<unknown>>()

export function singleFlight<T>(key: string, fn: () => Promise<T>, ttlMs = 0): Promise<T> {
  const existing = inflight.get(key)
  if (existing) return existing as Promise<T>
  const p = fn().then(
    (v) => {
      if (ttlMs > 0) setTimeout(() => inflight.delete(key), ttlMs).unref?.()
      else inflight.delete(key)
      return v
    },
    (e) => {
      inflight.delete(key)
      throw e
    }
  )
  inflight.set(key, p)
  return p
}

export const _resetSingleFlight = () => inflight.clear()
