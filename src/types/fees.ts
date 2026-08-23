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

export type InvoiceStatus = "unpaid" | "partially_paid" | "paid" | "overdue"

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

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "upi"

export const PAYMENT_METHODS: readonly PaymentMethod[] = ["cash", "card", "bank_transfer", "upi"]

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
