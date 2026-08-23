export interface Branch {
  id: string
  tenant_id: string
  name: string
  code: string
  address: string | null
  created_at: string
}

export interface BranchCreateInput {
  name: string
  code: string
  address?: string | null
}
