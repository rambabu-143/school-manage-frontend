export interface AcademicYear {
  id: string
  tenant_id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
}

export interface AcademicYearCreateInput {
  name: string
  start_date: string
  end_date: string
  is_current: boolean
}

export interface Grade {
  id: string
  tenant_id: string
  branch_id: string
  name: string
  sequence: number
}

export interface GradeCreateInput {
  branch_id: string
  name: string
  sequence: number
}

export interface Section {
  id: string
  tenant_id: string
  grade_id: string
  academic_year_id: string
  name: string
  capacity: number | null
}

export interface SectionCreateInput {
  grade_id: string
  academic_year_id: string
  name: string
  capacity?: number | null
}

export interface Enrollment {
  id: string
  tenant_id: string
  student_id: string
  section_id: string
  academic_year_id: string
  enrolled_date: string
  is_active: boolean
  created_at: string
}

export interface PromotionSkip {
  student_id: string
  reason: string
}

export interface PromotionResult {
  promoted: Enrollment[]
  skipped: PromotionSkip[]
}
