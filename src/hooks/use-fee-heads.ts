"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { FeeHead, FeeHeadCreateInput } from "@/types/fees"

export function useFeeHeads(branchId?: string) {
  return useQuery({
    queryKey: ["fee-heads", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<FeeHead[]>("/fee-heads", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateFeeHead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: FeeHeadCreateInput) => {
      const { data } = await apiClient.post<FeeHead>("/fee-heads", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-heads"] })
      toast.success("Fee head created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
