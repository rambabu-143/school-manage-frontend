export interface Notification {
  id: string
  tenant_id: string
  user_id: string
  category: string
  title: string
  body: string
  is_read: boolean
  created_at: string
}
