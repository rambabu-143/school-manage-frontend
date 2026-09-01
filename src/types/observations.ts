export interface ObservationRemark {
  id: string
  tenant_id: string
  student_id: string
  subject_id: string | null
  observed_by_id: string
  term: string
  remark: string
  created_at: string
}

export interface ObservationRemarkCreateInput {
  student_id: string
  subject_id?: string | null
  term: string
  remark: string
}
