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

export interface Shift {
  id: string
  tenant_id: string
  branch_id: string
  name: string
  start_time: string
  end_time: string
  grace_minutes: number
  half_day_hours: string
}

export interface ShiftCreateInput {
  branch_id: string
  name: string
  start_time: string
  end_time: string
  grace_minutes?: number
  half_day_hours?: string
}

export interface StaffShiftAssignment {
  id: string
  tenant_id: string
  staff_id: string
  shift_id: string
}

export interface StaffShiftAssignmentCreateInput {
  staff_id: string
  shift_id: string
}
