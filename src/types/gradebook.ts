export interface Subject {
  id: string
  tenant_id: string
  branch_id: string
  name: string
  code: string
}

export interface SubjectCreateInput {
  branch_id: string
  name: string
  code: string
}

export interface Exam {
  id: string
  tenant_id: string
  academic_year_id: string
  name: string
  weightage: number
  is_locked: boolean
  created_at: string
}

export interface ExamCreateInput {
  academic_year_id: string
  name: string
  weightage: number
}

export interface MarkEntry {
  student_id: string
  marks_obtained: number
  remarks?: string | null
}

export interface MarkBulkCreateInput {
  exam_id: string
  subject_id: string
  max_marks: number
  records: MarkEntry[]
}

export interface Mark {
  id: string
  tenant_id: string
  exam_id: string
  student_id: string
  subject_id: string
  marks_obtained: number
  max_marks: number
  remarks: string | null
  created_at: string
  updated_at: string
}

export interface ReportCardSubject {
  subject_id: string
  subject_name: string
  marks_obtained: number
  max_marks: number
  percentage: number
  remarks: string | null
}

export interface ReportCard {
  student_id: string
  exam_id: string
  exam_name: string
  subjects: ReportCardSubject[]
  total_obtained: number
  total_max: number
  overall_percentage: number
}

export interface CumulativeExamResult {
  exam_id: string
  exam_name: string
  weightage: number
  percentage: number
}

export interface CumulativeReport {
  student_id: string
  academic_year_id: string
  exams: CumulativeExamResult[]
  overall_percentage: number
}

export interface ReportCardReleaseSetting {
  id: string
  tenant_id: string
  branch_id: string
  academic_year_id: string
  grade_id: string
  is_live: boolean
  live_at: string | null
}

export interface ReportCardReleaseSettingUpsertInput {
  branch_id: string
  academic_year_id: string
  grade_id: string
  is_live: boolean
  live_at?: string | null
}
