"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { TransportSlab, TransportSlabCreateInput } from "@/types/transport"

export function useTransportSlabs(branchId?: string) {
  return useQuery({
    queryKey: ["transport-slabs", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<TransportSlab[]>("/transport-slabs", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateTransportSlab() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TransportSlabCreateInput) => {
      const { data } = await apiClient.post<TransportSlab>("/transport-slabs", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-slabs"] })
      toast.success("Fare slab created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
