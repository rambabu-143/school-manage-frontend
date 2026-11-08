// Limits mirror the backend (documents_max_upload_bytes = 10 MiB; bulk import CSV types;
// id-card photos PNG/JPEG). The server stays the authority - this is early feedback only.
export interface FileRule { maxBytes: number; types: readonly string[]; extensions: readonly string[]; label: string }

const MiB = 1024 * 1024
export const CSV_RULE: FileRule = {
  maxBytes: 10 * MiB,
  types: ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain", ""],
  extensions: [".csv"],
  label: "CSV up to 10 MB",
}
export const IMAGE_RULE: FileRule = {
  maxBytes: 10 * MiB,
  types: ["image/png", "image/jpeg"],
  extensions: [".png", ".jpg", ".jpeg"],
  label: "PNG or JPEG up to 10 MB",
}

export function validateFile(file: { name: string; size: number; type: string }, rule: FileRule): string | null {
  const name = file.name.toLowerCase()
  if (!rule.extensions.some((e) => name.endsWith(e)) || !rule.types.includes(file.type)) {
    return `${file.name}: unsupported file type. Allowed: ${rule.label}.`
  }
  if (file.size === 0) return `${file.name}: file is empty.`
  if (file.size > rule.maxBytes) return `${file.name}: larger than ${Math.round(rule.maxBytes / MiB)} MB.`
  return null
}
