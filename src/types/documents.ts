export interface DocumentFile {
  id: string
  tenant_id: string
  branch_id: string
  student_id: string | null
  staff_id: string | null
  gallery_album_id: string | null
  uploaded_by_user_id: string
  title: string
  description: string | null
  original_filename: string
  content_type: string | null
  size_bytes: number
  created_at: string
}

export interface DocumentUploadInput {
  file: File
  title: string
  branch_id: string
  description?: string
  student_id?: string
  staff_id?: string
  gallery_album_id?: string
}
