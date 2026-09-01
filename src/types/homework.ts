export interface HomeworkAssignment {
  id: string
  tenant_id: string
  section_id: string
  subject_id: string
  assigned_by_id: string
  title: string
  description: string
  due_date: string
  created_at: string
}

export interface HomeworkAssignmentCreateInput {
  section_id: string
  subject_id: string
  title: string
  description: string
  due_date: string
}
