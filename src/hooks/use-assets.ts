"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Asset, AssetCreateInput, AssetStatus } from "@/types/inventory"

export function useAssets(params?: { branchId?: string; status?: AssetStatus }) {
  return useQuery({
    queryKey: ["assets", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Asset[]>("/assets", {
        params: { branch_id: params?.branchId, status: params?.status },
      })
      return data
    },
  })
}

export function useCreateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AssetCreateInput) => {
      const { data } = await apiClient.post<Asset>("/assets", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] })
      toast.success("Asset created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdateAssetStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AssetStatus }) => {
      const { data } = await apiClient.post<Asset>(`/assets/${id}/status`, { status })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] })
      toast.success("Asset status updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
