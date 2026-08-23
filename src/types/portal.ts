export interface DisciplinaryRecord {
  id: string
  tenant_id: string
  student_id: string
  incident_date: string
  category: string
  severity: string
  description: string
  action_taken: string | null
  reported_by_id: string
  status: string
  resolved_at: string | null
  created_at: string
}
