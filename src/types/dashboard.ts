import type { Holiday } from "@/types/holidays"
import type { Notice } from "@/types/notices"

export interface ContractExpiringStaff {
  staff_id: string
  first_name: string
  last_name: string
  contract_end_date: string
  days_remaining: number
}

export interface DashboardSummary {
  student_count: number
  staff_count: number
  fees_collected_this_month: string
  fees_outstanding: string
  pending_leave_applications: number
  contract_expiring_staff: ContractExpiringStaff[]
  upcoming_holidays: Holiday[]
  recent_notices: Notice[]
}
