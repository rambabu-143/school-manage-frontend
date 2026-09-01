export interface PaymentGatewayConfig {
  id: string
  tenant_id: string
  gateway: string
  key_id: string
  is_active: boolean
}

export interface PaymentGatewayConfigUpdateInput {
  key_id: string
  key_secret: string
  webhook_secret: string
  is_active: boolean
}

export type PaymentOrderStatus = "created" | "paid" | "failed"

export interface PaymentOrder {
  id: string
  tenant_id: string
  invoice_id: string
  gateway: string
  gateway_order_id: string
  amount: string
  currency: string
  status: PaymentOrderStatus
  created_at: string
  verified_at: string | null
}

export interface PaymentOrderCreateResponse extends PaymentOrder {
  razorpay_key_id: string
}

export interface PaymentOrderCreateInput {
  invoice_id: string
  amount?: number
}

export interface PaymentOrderVerifyInput {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}
