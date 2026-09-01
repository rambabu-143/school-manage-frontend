export interface Department {
  id: string
  tenant_id: string
  name: string
  sequence: number
}

export interface DepartmentCreateInput {
  name: string
  sequence?: number
}
