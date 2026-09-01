export interface GalleryAlbum {
  id: string
  tenant_id: string
  branch_id: string
  year_session: string
  title: string
  description: string | null
  created_by_user_id: string
  created_at: string
}

export interface GalleryAlbumCreateInput {
  branch_id: string
  year_session: string
  title: string
  description?: string | null
}
