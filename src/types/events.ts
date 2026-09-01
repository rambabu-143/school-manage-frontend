export interface Event {
  id: string
  tenant_id: string
  branch_id: string
  created_by_user_id: string
  title: string
  description: string | null
  venue: string | null
  event_date: string
  max_participants: number | null
  created_at: string
}

export interface EventCreateInput {
  branch_id: string
  title: string
  description?: string | null
  venue?: string | null
  event_date: string
  max_participants?: number | null
}

export interface EventParticipant {
  id: string
  tenant_id: string
  event_id: string
  student_id: string
  registered_at: string
}

export interface EventScore {
  id: string
  tenant_id: string
  event_id: string
  student_id: string
  judge_user_id: string
  marks: number
  remark: string | null
  created_at: string
}

export interface EventScoreCreateInput {
  student_id: string
  marks: number
  remark?: string | null
}

export interface EventPhoto {
  id: string
  tenant_id: string
  event_id: string
  uploaded_by_user_id: string
  image_url: string
  caption: string | null
  created_at: string
}

export interface EventPhotoCreateInput {
  image_url: string
  caption?: string | null
}
