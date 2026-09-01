"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { GalleryAlbum, GalleryAlbumCreateInput } from "@/types/gallery"

export function useGalleryAlbums(params?: { branchId?: string; yearSession?: string }) {
  return useQuery({
    queryKey: ["gallery-albums", params],
    queryFn: async () => {
      const { data } = await apiClient.get<GalleryAlbum[]>("/gallery-albums", {
        params: { branch_id: params?.branchId, year_session: params?.yearSession },
      })
      return data
    },
  })
}

export function useCreateGalleryAlbum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: GalleryAlbumCreateInput) => {
      const { data } = await apiClient.post<GalleryAlbum>("/gallery-albums", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-albums"] })
      toast.success("Album created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteGalleryAlbum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (albumId: string) => {
      await apiClient.delete(`/gallery-albums/${albumId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-albums"] })
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      toast.success("Album deleted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
