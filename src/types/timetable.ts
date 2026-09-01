export interface Period {
  id: string
  tenant_id: string
  branch_id: string
  name: string
  start_time: string
  end_time: string
  sequence: number
}

export interface PeriodCreateInput {
  branch_id: string
  name: string
  start_time: string
  end_time: string
  sequence: number
}

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
}

export interface TimetableEntry {
  id: string
  tenant_id: string
  section_id: string
  period_id: string
  day_of_week: string
  subject_id: string
  staff_id: string
}

export interface TimetableEntryCreateInput {
  section_id: string
  period_id: string
  day_of_week: DayOfWeek
  subject_id: string
  staff_id: string
}
