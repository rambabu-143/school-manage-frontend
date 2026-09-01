export const CCA_GRADES = ["A+", "A", "B+", "B", "C+", "C", "D"] as const
export type CcaGrade = (typeof CCA_GRADES)[number]

export interface CcaActivity {
  id: string
  tenant_id: string
  branch_id: string
  name: string
  is_active: boolean
}

export interface CcaActivityCreateInput {
  branch_id: string
  name: string
}

export interface CcaIndicator {
  id: string
  tenant_id: string
  activity_id: string
  name: string
  sequence: number
}

export interface CcaIndicatorCreateInput {
  activity_id: string
  name: string
  sequence?: number
}

export interface CcaGradeEntry {
  id: string
  tenant_id: string
  student_id: string
  indicator_id: string
  academic_year_id: string
  grade: CcaGrade
  graded_by_id: string | null
  created_at: string
  updated_at: string
}

export interface CcaGradeEntryItem {
  student_id: string
  grade: CcaGrade
}

export interface CcaGradeBulkCreateInput {
  indicator_id: string
  academic_year_id: string
  records: CcaGradeEntryItem[]
}

export interface CcaReportCardEntry {
  activity_id: string
  activity_name: string
  indicator_id: string
  indicator_name: string
  grade: string
}

export interface CcaReportCard {
  student_id: string
  academic_year_id: string
  entries: CcaReportCardEntry[]
}
