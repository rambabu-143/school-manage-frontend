export interface SelfAwarenessForm {
  id: string
  tenant_id: string
  student_id: string
  goal: string | null
  strength: string | null
  interests_hobbies: string | null
  responsibilities: string | null
  updated_at: string
}

export interface SelfAwarenessFormInput {
  goal?: string | null
  strength?: string | null
  interests_hobbies?: string | null
  responsibilities?: string | null
}
