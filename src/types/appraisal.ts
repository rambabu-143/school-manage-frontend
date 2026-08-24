export type AppraisalCycleStatus = "open" | "closed"

export interface AppraisalCycle {
  id: string
  tenant_id: string
  academic_year_id: string
  name: string
  status: AppraisalCycleStatus
  created_at: string
}

export interface AppraisalCycleCreateInput {
  academic_year_id: string
  name: string
}

export type AppraisalStatus = "draft" | "submitted" | "acknowledged"

export interface StaffAppraisal {
  id: string
  tenant_id: string
  cycle_id: string
  staff_id: string
  reviewer_id: string
  rating: number
  strengths: string | null
  areas_for_improvement: string | null
  overall_comments: string | null
  status: AppraisalStatus
  submitted_at: string | null
  acknowledged_at: string | null
  created_at: string
}

export interface StaffAppraisalCreateInput {
  cycle_id: string
  staff_id: string
  rating: number
  strengths?: string | null
  areas_for_improvement?: string | null
  overall_comments?: string | null
}
