export type HolidayType = "national" | "festival" | "summer_break" | "winter_break" | "week_off"

export interface Holiday {
  id: string
  tenant_id: string
  branch_id: string
  title: string
  description: string | null
  holiday_type: HolidayType
  holiday_date: string
  created_at: string
}

export interface HolidayCreateInput {
  branch_id: string
  title: string
  description?: string | null
  holiday_type: HolidayType
  holiday_date: string
}
