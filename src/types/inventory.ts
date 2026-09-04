export interface Vendor {
  id: string
  tenant_id: string
  branch_id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
}

export interface VendorCreateInput {
  branch_id: string
  name: string
  contact_person?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
}

export interface ProductCategory {
  id: string
  tenant_id: string
  branch_id: string
  name: string
}

export interface ProductCategoryCreateInput {
  branch_id: string
  name: string
}

export interface Product {
  id: string
  tenant_id: string
  branch_id: string
  category_id: string
  name: string
  unit: string
}

export interface ProductCreateInput {
  branch_id: string
  category_id: string
  name: string
  unit: string
}

export type AssetStatus = "in_use" | "under_repair" | "disposed"
export const ASSET_STATUSES: readonly AssetStatus[] = ["in_use", "under_repair", "disposed"]

export interface Asset {
  id: string
  tenant_id: string
  branch_id: string
  category_id: string | null
  asset_tag: string
  name: string
  purchase_date: string
  purchase_cost: number
  status: AssetStatus
}

export interface AssetCreateInput {
  branch_id: string
  category_id?: string | null
  asset_tag: string
  name: string
  purchase_date: string
  purchase_cost: number
}

export type PurchaseOrderStatus = "draft" | "ordered" | "received" | "cancelled"
export const PURCHASE_ORDER_STATUSES: readonly PurchaseOrderStatus[] = [
  "draft",
  "ordered",
  "received",
  "cancelled",
]

export interface PurchaseOrder {
  id: string
  tenant_id: string
  branch_id: string
  vendor_id: string
  order_date: string
  description: string
  amount: number
  status: PurchaseOrderStatus
  created_at: string
}

export interface PurchaseOrderCreateInput {
  branch_id: string
  vendor_id: string
  description: string
  amount: number
}

export interface BillExtractItem {
  name: string
  quantity: number
  unit: string
  rate: number
}

export interface BillExtractResult {
  vendor_name: string | null
  invoice_no: string | null
  invoice_date: string | null
  items: BillExtractItem[]
}

export type RequisitionStatus = "pending" | "approved" | "rejected" | "fulfilled"

export interface Requisition {
  id: string
  tenant_id: string
  branch_id: string
  product_id: string
  requested_by_id: string
  quantity: number
  reason: string
  status: RequisitionStatus
  reviewed_by_id: string | null
  reviewed_at: string | null
  created_at: string
}

export interface RequisitionCreateInput {
  branch_id: string
  product_id: string
  quantity: number
  reason: string
}
