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

export interface TodayStudentAttendance {
  type: string
  marked: number
  total_present: number
  total_absent: number
}

export interface SectionBreakdown {
  section_id: string
  grade: string
  section: string
  total_students: number
  total_boys: number
  total_girls: number
}

export interface BranchDashboard {
  branch_id: string
  branch_name: string
  branch_code: string
  total_students: number
  total_staff: number
  student_attendance_today: TodayStudentAttendance
  staff_attendance_today: Record<string, number>
  sections: SectionBreakdown[]
  pending_leave_applications: number
}

export interface SuperAdminDashboard {
  total_students: number
  total_staff: number
  branches: BranchDashboard[]
}

export interface StaffAnalytics {
  total_students: number
  total_staff: number
  student_attendance_today: TodayStudentAttendance
  staff_attendance_today: Record<string, number>
  sections: SectionBreakdown[]
  recent_notices: Notice[]
}

export interface SectionDashboard {
  total_students: number
  students: {
    student_id: string
    admission_number: string
    first_name: string
    last_name: string
    today_status: string | null
    attendance: { present: number; absent: number; late: number; half_day: number; excused: number }
  }[]
}
