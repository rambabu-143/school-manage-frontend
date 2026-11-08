/** Extract a filename from Content-Disposition (RFC 5987 filename* preferred), stripped of path parts. */
export function filenameFromDisposition(header: unknown): string | null {
  if (typeof header !== "string") return null
  const star = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/.exec(header)
  let name: string | null = null
  if (star) {
    try {
      name = decodeURIComponent(star[1].trim())
    } catch {
      name = null
    }
  }
  if (!name) {
    const m = /filename\s*=\s*(?:"([^"]*)"|([^;]+))/.exec(header)
    name = (m?.[1] ?? m?.[2] ?? "").trim() || null
  }
  if (!name) return null
  const base = name.split(/[\\/]/).pop()!.replace(/[\x00-\x1f]/g, "")
  return base && base !== "." && base !== ".." ? base : null
}
