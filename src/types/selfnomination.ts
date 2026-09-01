export type NominationFormType = "junior" | "senior"

export interface SelfNomination {
  id: string
  tenant_id: string
  student_id: string
  form_type: NominationFormType
  statement: string
  created_at: string
}

export interface SelfNominationCreateInput {
  student_id: string
  form_type: NominationFormType
  statement: string
}

export interface SelfNominationReview {
  id: string
  tenant_id: string
  nomination_id: string
  reviewer_staff_id: string
  points: number
  remark: string | null
  created_at: string
}

export interface SelfNominationReviewCreateInput {
  points: number
  remark?: string | null
}
