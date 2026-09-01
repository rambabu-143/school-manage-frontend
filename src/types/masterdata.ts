export const MASTER_DATA_CATEGORIES = [
  "city",
  "state",
  "country",
  "bank",
  "occupation",
  "qualification",
  "mother_tongue",
  "cost_center",
  "special_need",
  "achievement",
  "prefect_post",
  "category",
  "employee_type",
  "concession_type",
] as const

export type MasterDataCategory = (typeof MASTER_DATA_CATEGORIES)[number]

export interface MasterDataItem {
  id: string
  tenant_id: string
  category: MasterDataCategory
  name: string
  code: string | null
  sort_order: number | null
  note: string | null
}

export interface MasterDataItemCreateInput {
  category: MasterDataCategory
  name: string
  code?: string | null
  sort_order?: number | null
  note?: string | null
}

export interface MasterDataItemUpdateInput {
  name?: string
  code?: string | null
  sort_order?: number | null
  note?: string | null
}
