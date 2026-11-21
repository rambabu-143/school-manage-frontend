export type NoticeAudience = "student" | "parent" | "staff" | "all"

export interface Notice {
  id: string
  tenant_id: string
  branch_id: string
  posted_by_user_id: string
  title: string
  body: string
  audience: NoticeAudience
  start_date: string
  end_date: string
  color_code: string | null
  location: string | null
  created_at: string
}

export interface NoticeCreateInput {
  branch_id: string
  title: string
  body: string
  audience: NoticeAudience
  start_date: string
  end_date: string
  color_code?: string | null
  location?: string | null
}

export interface NoticeUpdateInput {
  title?: string
  body?: string
  audience?: NoticeAudience
  start_date?: string
  end_date?: string
  color_code?: string | null
  location?: string | null
}

export interface NoticeSearchInput {
  branch_id?: string
  audience?: NoticeAudience
  start_date?: string
  end_date?: string
}

export interface NoticeGroup {
  id: string
  tenant_id: string
  name: string
  branch_id: string | null
  created_by_user_id: string
  created_at: string
  student_ids: string[]
  staff_ids: string[]
}

export interface NoticeGroupCreateInput {
  name: string
  branch_id?: string | null
  student_ids?: string[]
  staff_ids?: string[]
}

export interface NoticeGroupUpdateInput {
  name?: string
  student_ids?: string[]
  staff_ids?: string[]
}

export interface NoticeGroupDetail {
  id: string
  name: string
  students: { id: string; admission_number: string; name: string }[]
  staff: { id: string; employee_number: string; name: string; phone: string | null }[]
}

export interface BoardOfDirector {
  id: string
  tenant_id: string
  name: string
  email: string | null
  mobile: string | null
  designation: string
  is_active: boolean
  created_at: string
}

export interface BoardOfDirectorCreateInput {
  name: string
  email?: string | null
  mobile?: string | null
  designation: string
}

export interface BoardOfDirectorUpdateInput {
  name?: string
  email?: string | null
  mobile?: string | null
  designation?: string
  is_active?: boolean
}
