export interface Club {
  id: string
  tenant_id: string
  branch_id: string
  name: string
  category: string | null
  capacity: number | null
  coordinator_staff_id: string | null
}

export interface ClubCreateInput {
  branch_id: string
  name: string
  category?: string | null
  capacity?: number | null
  coordinator_staff_id?: string | null
}

export interface ClubMembership {
  id: string
  tenant_id: string
  club_id: string
  student_id: string
  joined_date: string
  created_at: string
}

export interface ClubMembershipCreateInput {
  club_id: string
  student_id: string
}
