export interface Guardian {
  id: string
  student_id: string
  user_id: string | null
  name: string
  relation: string
  phone: string | null
  email: string | null
}

export interface GuardianCreateInput {
  name: string
  relation: string
  phone?: string | null
  email?: string | null
  user_id?: string | null
}

export interface Student {
  id: string
  tenant_id: string
  branch_id: string
  admission_number: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string | null
  enrollment_date: string
  is_active: boolean
  blood_group: string | null
  allergies: string | null
  pen_number: string | null
  board_roll_number: string | null
  created_at: string
  updated_at: string
  guardians: Guardian[]
}

export interface StudentCreateInput {
  branch_id: string
  admission_number: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender?: string | null
  blood_group?: string | null
  allergies?: string | null
  pen_number?: string | null
  board_roll_number?: string | null
}

export interface StudentUpdateInput {
  branch_id?: string
  first_name?: string
  last_name?: string
  gender?: string | null
  is_active?: boolean
  blood_group?: string | null
  allergies?: string | null
  pen_number?: string | null
  board_roll_number?: string | null
}

export interface Staff {
  id: string
  tenant_id: string
  branch_id: string
  user_id: string | null
  department_id: string | null
  employee_number: string
  first_name: string
  last_name: string
  designation: string
  phone: string | null
  email: string | null
  date_of_joining: string
  is_active: boolean
  contract_end_date: string | null
  created_at: string
  updated_at: string
}

export interface StaffCreateInput {
  branch_id: string
  employee_number: string
  first_name: string
  last_name: string
  designation: string
  phone?: string | null
  email?: string | null
  user_id?: string | null
  department_id?: string | null
  contract_end_date?: string | null
}

export interface StaffUpdateInput {
  branch_id?: string
  first_name?: string
  last_name?: string
  designation?: string
  phone?: string | null
  email?: string | null
  is_active?: boolean
  user_id?: string | null
  department_id?: string | null
  contract_end_date?: string | null
}
