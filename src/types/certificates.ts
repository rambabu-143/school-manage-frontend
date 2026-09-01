export const CERTIFICATE_TYPES = ["bonafide", "transfer", "character", "study"] as const
export type CertificateType = (typeof CERTIFICATE_TYPES)[number]

export interface CertificateRecord {
  id: string
  tenant_id: string
  student_id: string
  certificate_type: CertificateType
  serial_number: number
  reason: string | null
  issue_date: string
  issued_by_id: string
  created_at: string
}

export interface CertificateRecordCreateInput {
  student_id: string
  certificate_type: CertificateType
  reason?: string | null
}
