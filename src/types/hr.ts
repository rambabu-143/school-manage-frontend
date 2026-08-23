export type LeaveType = "casual" | "sick" | "earned" | "unpaid"
export const LEAVE_TYPES: readonly LeaveType[] = ["casual", "sick", "earned", "unpaid"]

export type LeaveStatus = "pending" | "approved" | "rejected"

export interface LeaveApplication {
  id: string
  tenant_id: string
  staff_id: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  reason: string
  status: LeaveStatus
  review_comment: string | null
  reviewed_by_id: string | null
  reviewed_at: string | null
  created_at: string
}

export interface LeaveApplicationCreateInput {
  staff_id: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  reason: string
}
