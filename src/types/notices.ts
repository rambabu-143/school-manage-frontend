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
