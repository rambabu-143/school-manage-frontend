"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  MasterDataCategory,
  MasterDataItem,
  MasterDataItemCreateInput,
  MasterDataItemUpdateInput,
} from "@/types/masterdata"

export function useMasterData(category?: MasterDataCategory) {
  return useQuery({
    queryKey: ["master-data", { category }],
    queryFn: async () => {
      const { data } = await apiClient.get<MasterDataItem[]>("/master-data", {
        params: category ? { category } : undefined,
      })
      return data
    },
  })
}

export function useCreateMasterDataItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: MasterDataItemCreateInput) => {
      const { data } = await apiClient.post<MasterDataItem>("/master-data", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-data"] })
      toast.success("Item created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdateMasterDataItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: MasterDataItemUpdateInput & { id: string }) => {
      const { data } = await apiClient.put<MasterDataItem>(`/master-data/${id}`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-data"] })
      toast.success("Item updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteMasterDataItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/master-data/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-data"] })
      toast.success("Item deleted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
