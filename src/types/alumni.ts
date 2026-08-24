export interface Alumni {
  id: string
  tenant_id: string
  student_id: string
  graduation_year: number
  current_institution: string | null
  occupation: string | null
  employer: string | null
  contact_email: string | null
  contact_phone: string | null
  notes: string | null
}

export interface AlumniCreateInput {
  student_id: string
  graduation_year: number
  current_institution?: string | null
  occupation?: string | null
  employer?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  notes?: string | null
}

export interface AlumniUpdateInput {
  current_institution?: string | null
  occupation?: string | null
  employer?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  notes?: string | null
}
