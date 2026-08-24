export interface Stream {
  id: string
  tenant_id: string
  branch_id: string
  name: string
}

export interface StreamCreateInput {
  branch_id: string
  name: string
}

export interface StreamCombination {
  id: string
  tenant_id: string
  stream_id: string
  name: string
  subject_ids: string[]
}

export interface StreamCombinationCreateInput {
  stream_id: string
  name: string
  subject_ids: string[]
}

export interface StreamSelection {
  id: string
  tenant_id: string
  student_id: string
  academic_year_id: string
  combination_id: string
  is_locked: boolean
  created_at: string
}

export interface StreamSelectionCreateInput {
  student_id: string
  academic_year_id: string
  combination_id: string
}
