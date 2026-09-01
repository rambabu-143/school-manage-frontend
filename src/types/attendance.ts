export type AttendanceStatus = "present" | "absent" | "late" | "half_day" | "excused"

export const ATTENDANCE_STATUSES: readonly AttendanceStatus[] = [
  "present",
  "absent",
  "late",
  "half_day",
  "excused",
]

export interface StudentAttendanceMark {
  student_id: string
  status: AttendanceStatus
  remarks?: string | null
}

export interface StudentAttendanceBulkCreateInput {
  section_id: string
  date: string
  records: StudentAttendanceMark[]
}

export interface StudentAttendanceRecord {
  id: string
  tenant_id: string
  student_id: string
  section_id: string
  date: string
  status: AttendanceStatus
  marked_by_id: string | null
  remarks: string | null
  created_at: string
  updated_at: string
}

export interface StaffAttendanceCreateInput {
  staff_id: string
  date: string
  status: AttendanceStatus
  remarks?: string | null
}

export type AttendanceSource = "manual" | "biometric"

export interface StaffAttendanceRecord {
  id: string
  tenant_id: string
  staff_id: string
  date: string
  status: AttendanceStatus
  source: AttendanceSource
  in_time: string | null
  out_time: string | null
  marked_by_id: string | null
  remarks: string | null
  created_at: string
  updated_at: string
}

export interface MachinePunch {
  staff_id: string
  punched_at: string
}

export interface MachinePunchImportInput {
  punches: MachinePunch[]
}

export interface StudentAttendanceSummary {
  student_id: string
  first_name: string
  last_name: string
  present: number
  absent: number
  late: number
  half_day: number
  excused: number
  total: number
}
