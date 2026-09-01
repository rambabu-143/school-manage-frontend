export interface IdCardData {
  student_id: string
  branch_id: string
  admission_number: string
  first_name: string
  last_name: string
  date_of_birth: string
  grade_name: string | null
  section_name: string | null
  guardian_name: string | null
  guardian_phone: string | null
  transport_route_name: string | null
  transport_stop_name: string | null
}

export type IdCardUpdateRequestStatus = "pending" | "resolved"

export interface IdCardUpdateRequest {
  id: string
  tenant_id: string
  student_id: string
  requested_by_id: string | null
  notes: string
  status: IdCardUpdateRequestStatus
  resolved_by_id: string | null
  resolved_at: string | null
  created_at: string
}

export interface IdCardUpdateRequestCreateInput {
  notes: string
}

export interface StudentPhotoUploadResult {
  passed: boolean
  reason: string
  width: number
  height: number
  document_id: string | null
}
