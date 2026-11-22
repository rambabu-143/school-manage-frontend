// Pure helpers for the student medical edit form (PUT /students/{id}/medical).
export interface MedicalForm { blood_group: string; allergies: string; medical: string }

export const MEDICAL_LIMITS = { blood_group: 10, allergies: 500 } as const

/** Blank fields are omitted (backend leaves them unchanged); `medical` must be a JSON object. */
export function buildMedicalPayload(f: MedicalForm): { body: Record<string, unknown>; errors: Record<string, string> } {
  const body: Record<string, unknown> = {}
  const errors: Record<string, string> = {}
  for (const k of ["blood_group", "allergies"] as const) {
    const v = f[k].trim()
    if (!v) continue
    if (v.length > MEDICAL_LIMITS[k]) errors[k] = `At most ${MEDICAL_LIMITS[k]} characters`
    else body[k] = v
  }
  const m = f.medical.trim()
  if (m) {
    try {
      const parsed: unknown = JSON.parse(m)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) body.medical = parsed
      else errors.medical = "Must be a JSON object"
    } catch {
      errors.medical = "Invalid JSON"
    }
  }
  if (!Object.keys(body).length && !Object.keys(errors).length) errors.blood_group = "Enter at least one field"
  return { body, errors }
}
