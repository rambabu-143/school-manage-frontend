export type EnquirySource = "walk_in" | "website" | "referral" | "other"
export const ENQUIRY_SOURCES: readonly EnquirySource[] = [
  "walk_in",
  "website",
  "referral",
  "other",
]

export type EnquiryStatus = "new" | "contacted" | "converted" | "closed"
export const ENQUIRY_STATUSES: readonly EnquiryStatus[] = [
  "new",
  "contacted",
  "converted",
  "closed",
]

export interface Enquiry {
  id: string
  tenant_id: string
  branch_id: string
  student_name: string
  grade_interested: string
  parent_name: string
  phone: string
  email: string | null
  source: EnquirySource
  status: EnquiryStatus
  notes: string | null
  created_at: string
}

export interface EnquiryCreateInput {
  branch_id: string
  student_name: string
  grade_interested: string
  parent_name: string
  phone: string
  email?: string | null
  source: EnquirySource
  notes?: string | null
}

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "enrolled"

export interface AdmissionApplication {
  id: string
  tenant_id: string
  branch_id: string
  enquiry_id: string | null
  grade_applying_for_id: string
  applicant_first_name: string
  applicant_last_name: string
  date_of_birth: string
  guardian_name: string
  guardian_phone: string
  guardian_email: string | null
  status: ApplicationStatus
  rejection_reason: string | null
  student_id: string | null
  decided_by_id: string | null
  decided_at: string | null
  created_at: string
}

export interface ApplicationCreateInput {
  branch_id: string
  enquiry_id?: string | null
  grade_applying_for_id: string
  applicant_first_name: string
  applicant_last_name: string
  date_of_birth: string
  guardian_name: string
  guardian_phone: string
  guardian_email?: string | null
}
