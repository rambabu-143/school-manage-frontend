export type ProgressStatus = "not_started" | "in_progress" | "completed"
export const PROGRESS_STATUSES: readonly ProgressStatus[] = [
  "not_started",
  "in_progress",
  "completed",
]

export interface SyllabusTopic {
  id: string
  tenant_id: string
  subject_id: string
  grade_id: string
  academic_year_id: string
  title: string
  sequence: number
  planned_completion_date: string | null
}

export interface SyllabusTopicCreateInput {
  subject_id: string
  grade_id: string
  academic_year_id: string
  title: string
  sequence: number
  planned_completion_date?: string | null
}

export interface SyllabusProgressUpdateInput {
  section_id: string
  status: ProgressStatus
  remarks?: string | null
}

export interface SectionCoverageTopic {
  topic_id: string
  title: string
  sequence: number
  planned_completion_date: string | null
  status: ProgressStatus
  completed_date: string | null
}

export interface SectionCoverage {
  section_id: string
  subject_id: string
  topics: SectionCoverageTopic[]
  completion_percentage: number
}
