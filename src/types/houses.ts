export interface House {
  id: string
  tenant_id: string
  branch_id: string
  name: string
  color: string | null
  captain_staff_id: string | null
}

export interface HouseCreateInput {
  branch_id: string
  name: string
  color?: string | null
  captain_staff_id?: string | null
}

export interface HouseMembership {
  id: string
  tenant_id: string
  student_id: string
  house_id: string
}

export interface HousePoints {
  id: string
  tenant_id: string
  house_id: string
  academic_year_id: string
  points: number
  reason: string
  awarded_by_id: string
  awarded_date: string
  created_at: string
}

export interface HousePointsCreateInput {
  house_id: string
  academic_year_id: string
  points: number
  reason: string
  awarded_date?: string | null
}

export interface HouseLeaderboardEntry {
  house_id: string
  house_name: string
  total_points: number
}

export interface HouseLeaderboard {
  academic_year_id: string
  houses: HouseLeaderboardEntry[]
}
