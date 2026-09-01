export interface EmailConfig {
  id: string
  tenant_id: string
  smtp_host: string
  smtp_port: number
  smtp_username: string
  use_tls: boolean
  from_email: string
  from_name: string | null
  is_active: boolean
  updated_at: string
}

export interface EmailConfigUpdateInput {
  smtp_host: string
  smtp_port: number
  smtp_username: string
  smtp_password: string
  use_tls: boolean
  from_email: string
  from_name?: string | null
  is_active: boolean
}

export type EmailMessageStatus = "sent" | "partial" | "failed"
export type RecipientStatus = "sent" | "failed"

export interface EmailMessageRecipient {
  id: string
  email: string
  status: RecipientStatus
  error: string | null
}

export interface EmailMessage {
  id: string
  tenant_id: string
  subject: string
  body: string
  status: EmailMessageStatus
  sent_by_id: string | null
  sent_at: string
  recipients: EmailMessageRecipient[]
}

export interface EmailMessageCreateInput {
  subject: string
  body: string
  student_ids?: string[]
  staff_ids?: string[]
  extra_emails?: string[]
}

export interface SmsConfig {
  id: string
  tenant_id: string
  sender_id: string
  is_active: boolean
  updated_at: string
}

export interface SmsConfigUpdateInput {
  api_key: string
  sender_id: string
  is_active: boolean
}

export type SmsMessageStatus = "sent" | "failed"

export interface SmsMessage {
  id: string
  tenant_id: string
  body: string
  status: SmsMessageStatus
  sent_by_id: string | null
  sent_at: string
  recipients: string[]
}

export interface SmsMessageCreateInput {
  body: string
  student_ids?: string[]
  staff_ids?: string[]
  extra_phones?: string[]
}
