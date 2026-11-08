/** Open-redirect guard for the login `next` param: same-origin absolute paths only. */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback
  if (/[\u0000-\u001f\u007f]/.test(next)) return fallback
  try {
    const u = new URL(next, "http://x.invalid")
    return u.origin === "http://x.invalid" ? next : fallback
  } catch {
    return fallback
  }
}
