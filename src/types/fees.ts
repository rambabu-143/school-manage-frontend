export interface FeeHead {
  id: string
  tenant_id: string
  branch_id: string
  name: string
  is_refundable: boolean
}

export interface FeeHeadCreateInput {
  branch_id: string
  name: string
  is_refundable: boolean
}

export interface Concession {
  id: string
  tenant_id: string
  student_id: string
  academic_year_id: string
  concession_type: string
  amount: number
  reason: string | null
  is_active: boolean
  created_at: string
}

export interface ConcessionCreateInput {
  student_id: string
  academic_year_id: string
  concession_type: string
  amount: number
  reason?: string | null
}

export type InvoiceStatus = "unpaid" | "partial" | "paid"

export interface Invoice {
  id: string
  tenant_id: string
  student_id: string
  academic_year_id: string
  fee_head_id: string | null
  amount: number
  discount_amount: number
  amount_due: number
  due_date: string
  status: InvoiceStatus
  created_at: string
}

export interface InvoiceCreateInput {
  student_id: string
  academic_year_id: string
  fee_head_id?: string | null
  amount: number
  due_date: string
}

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "upi" | "online"

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  "cash",
  "card",
  "bank_transfer",
  "upi",
  "online",
]

export interface Payment {
  id: string
  tenant_id: string
  invoice_id: string
  amount: number
  paid_date: string
  method: PaymentMethod
  recorded_by_id: string | null
  created_at: string
}

export interface PaymentCreateInput {
  amount: number
  method: PaymentMethod
  paid_date?: string | null
}

export interface ConcessionRenewal {
  id: string
  tenant_id: string
  student_id: string
  academic_year_id: string
  residential_status: string
  teacher_feedback_parent: string | null
  teacher_feedback_student: string | null
  annual_income_father: string | null
  annual_income_mother: string | null
  income_variation: string | null
  home_visit_report: string | null
  home_visit_staff_id: string | null
  home_visit_staff2_id: string | null
  home_visit_point: number | null
  concession_from: string | null
  fee_payment_record: string | null
  fee_office_remark: string | null
  final_remark: string | null
  created_by_id: string | null
  updated_by_id: string | null
  created_at: string
  updated_at: string
}

export interface ConcessionRenewalUpsertInput {
  student_id: string
  academic_year_id: string
  residential_status: string
  teacher_feedback_parent?: string | null
  teacher_feedback_student?: string | null
  annual_income_father?: string | null
  annual_income_mother?: string | null
  income_variation?: string | null
  home_visit_report?: string | null
  home_visit_staff_id?: string | null
  home_visit_staff2_id?: string | null
  home_visit_point?: number | null
  concession_from?: string | null
  fee_payment_record?: string | null
  fee_office_remark?: string | null
  final_remark?: string | null
}
