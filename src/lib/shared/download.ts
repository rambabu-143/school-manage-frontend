const TYPE_EXT: Record<string, string> = {
  "application/pdf": "pdf", "text/csv": "csv", "image/png": "png", "image/jpeg": "jpg",
  "application/zip": "zip", "text/plain": "txt",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
}
const SAFE_EXT = new Set(["pdf", "csv", "png", "jpg", "jpeg", "zip", "txt", "xlsx"])

const mime = (t: string | undefined | null) => (t ?? "").split(";")[0].trim().toLowerCase()

/** Only types a browser renders without executing script may be opened in a tab. */
export function canOpenInline(contentType: string | undefined | null): boolean {
  const t = mime(contentType)
  return t === "application/pdf" || (t.startsWith("image/") && t !== "image/svg+xml")
}

/** Extract a filename from Content-Disposition. filename* is used only for UTF-8; other charsets fall back to filename. */
export function filenameFromDisposition(header: unknown): string | null {
  if (typeof header !== "string") return null
  const star = /filename\*\s*=\s*([^';]+)'[^']*'([^;]+)/i.exec(header)
  let name: string | null = null
  if (star && /^utf-?8$/i.test(star[1].trim())) {
    try {
      name = decodeURIComponent(star[2].trim())
    } catch {
      name = null
    }
  }
  if (!name) {
    const m = /(?<![*\w])filename\s*=\s*(?:"([^"]*)"|([^;]+))/i.exec(header)
    name = (m?.[1] ?? m?.[2] ?? "").trim() || null
  }
  return name
}

/**
 * Safe single-extension file name: strips paths, control and reserved chars, trailing dots/spaces,
 * collapses "a.pdf.exe" to one extension taken from the content type (else an allow-listed last extension).
 */
export function safeDownloadName(name: string | null, contentType?: string | null, fallback = "download"): string {
  const base = (name ?? "").split(/[\\/]/).pop()!.replace(/[\x00-\x1f<>:"|?*]/g, "").replace(/[. ]+$/, "").trim()
  const parts = base.split(".").filter(Boolean)
  const stem = (parts[0] ?? "").trim() || fallback
  const last = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ""
  const ext = TYPE_EXT[mime(contentType)] ?? (SAFE_EXT.has(last) ? last : "")
  // everything after the first dot is dropped (kills "a.pdf.exe" tricks); the one extension is re-added above
  const cleanStem = stem
  return ext ? `${cleanStem}.${ext}` : cleanStem
}
