export interface ComboSubject {
  id: string
  subject_id: string
}

export interface Combo {
  id: string
  tenant_id: string
  name: string
  grade_id: string
  academic_year_id: string
  subjects: ComboSubject[]
}

export interface ComboCreateInput {
  name: string
  grade_id: string
  academic_year_id: string
  subjects: { subject_id: string }[]
}

export interface StudentCombo {
  id: string
  tenant_id: string
  student_id: string
  combo_id: string
  academic_year_id: string
}

export interface StudentComboAssignInput {
  combo_id: string
}

export interface ComboPromotionSkip {
  student_id: string
  reason: string
}

export interface ComboPromotionResult {
  promoted: StudentCombo[]
  skipped: ComboPromotionSkip[]
}

export interface ComboPromotionInput {
  student_ids: string[]
  target_combo_id: string
}
