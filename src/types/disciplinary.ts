export type Severity = "minor" | "major" | "severe"
export const SEVERITIES: readonly Severity[] = ["minor", "major", "severe"]

export type DisciplinaryStatus = "open" | "resolved"

export interface DisciplinaryRecord {
  id: string
  tenant_id: string
  student_id: string
  incident_date: string
  category: string
  severity: Severity
  description: string
  action_taken: string | null
  reported_by_id: string
  status: DisciplinaryStatus
  resolved_at: string | null
  created_at: string
}

export interface DisciplinaryRecordCreateInput {
  student_id: string
  incident_date: string
  category: string
  severity: Severity
  description: string
  action_taken?: string | null
}
