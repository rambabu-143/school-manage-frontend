import type { Field } from "./types"

type Raw = Record<string, unknown>

/** datetime-local value <-> ISO. */
export const toIso = (v: string) => (v ? new Date(v).toISOString() : v)
export const fromIso = (v: unknown) => {
  if (typeof v !== "string" || !v) return ""
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ""
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

/** API row -> form state (strings for inputs, booleans, arrays). */
export function toFormValues(fields: Field[], row?: Raw): Raw {
  const out: Raw = {}
  for (const f of fields) {
    const v = row?.[f.name]
    const k = f.kind ?? "text"
    if (k === "bool") out[f.name] = Boolean(v)
    else if (k === "multi") out[f.name] = Array.isArray(v) ? v : []
    else if (k === "lines") out[f.name] = Array.isArray(v) ? v.join("\n") : ""
    else if (k === "datetime") out[f.name] = fromIso(v)
    else if (k === "time") out[f.name] = typeof v === "string" ? v.slice(0, 5) : ""
    else out[f.name] = v === null || v === undefined ? "" : String(v)
  }
  return out
}

/** Form state -> request body. Empty optional values are omitted; returns field errors for missing required ones. */
export function buildPayload(fields: Field[], values: Raw, opts: { editing?: boolean; scope?: Raw } = {}) {
  const body: Raw = {}
  const errors: Record<string, string> = {}
  for (const f of fields) {
    if (opts.editing && f.createOnly) continue
    if (!opts.editing && f.editOnly) continue
    if (f.pathParam) continue
    const k = f.kind ?? "text"
    let v: unknown = f.scoped ? opts.scope?.[f.name] : values[f.name]
    if (k === "bool") v = Boolean(v)
    else if (k === "multi") v = Array.isArray(v) ? v : []
    else if (k === "lines") v = String(v ?? "").split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
    else if (k === "number") v = v === "" || v === undefined || v === null ? "" : Number(v)
    else if (k === "datetime") v = v ? toIso(String(v)) : ""
    const empty = v === "" || v === undefined || v === null || (Array.isArray(v) && v.length === 0 && k !== "multi")
    if (empty) {
      if (f.required && !(opts.editing && f.optionalOnEdit)) errors[f.name] = `${f.label} is required`
      continue
    }
    if (k === "number" && Number.isNaN(v)) { errors[f.name] = `${f.label} must be a number`; continue }
    body[f.name] = v
  }
  return { body, errors }
}

/** Substitute {id}-style params from a row. */
export function fillRow(path: string, row: Raw, idKey = "id") {
  return path.replace(/\{id\}/g, encodeURIComponent(String(row[idKey])))
}

/** Rows of a report response: arrays, single objects, or {nested:[...]} flattened. */
export function reportRows(data: unknown, flatten?: string): Raw[] {
  if (data === null || data === undefined) return []
  const arr = (Array.isArray(data) ? data : [data]) as Raw[]
  if (!flatten) return arr
  return arr.flatMap((r) => {
    const { [flatten]: nested, ...rest } = r
    return Array.isArray(nested) && nested.length ? (nested as Raw[]).map((n) => ({ ...rest, ...n })) : [rest]
  })
}
