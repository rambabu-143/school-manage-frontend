"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { DocumentFile, DocumentUploadInput } from "@/types/documents"

export function useDocuments(params?: {
  search?: string
  studentId?: string
  staffId?: string
  galleryAlbumId?: string
}) {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: async () => {
      const { data } = await apiClient.get<DocumentFile[]>("/documents", {
        params: {
          search: params?.search || undefined,
          student_id: params?.studentId || undefined,
          staff_id: params?.staffId || undefined,
          gallery_album_id: params?.galleryAlbumId || undefined,
        },
      })
      return data
    },
    enabled: params?.galleryAlbumId === undefined || !!params.galleryAlbumId,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: DocumentUploadInput) => {
      const formData = new FormData()
      formData.append("file", input.file)
      formData.append("title", input.title)
      formData.append("branch_id", input.branch_id)
      if (input.description) formData.append("description", input.description)
      if (input.student_id) formData.append("student_id", input.student_id)
      if (input.staff_id) formData.append("staff_id", input.staff_id)
      if (input.gallery_album_id) formData.append("gallery_album_id", input.gallery_album_id)

      const { data } = await apiClient.post<DocumentFile>("/documents", formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      toast.success("Document uploaded")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/documents/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      toast.success("Document deleted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function documentDownloadUrl(id: string): string {
  return `/api/backend/documents/${id}/download`
}
