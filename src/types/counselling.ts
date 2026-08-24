export type CounsellingStatus = "open" | "closed"

export interface CounsellingRecord {
  id: string
  tenant_id: string
  student_id: string
  counsellor_id: string
  session_date: string
  category: string
  notes: string
  follow_up_required: boolean
  follow_up_date: string | null
  status: CounsellingStatus
  closed_at: string | null
  created_at: string
}

export interface CounsellingRecordCreateInput {
  student_id: string
  session_date: string
  category: string
  notes: string
  follow_up_required: boolean
  follow_up_date?: string | null
}
