"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Branch, BranchCreateInput } from "@/types/branches"

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data } = await apiClient.get<Branch[]>("/branches")
      return data
    },
  })
}

export function useCreateBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: BranchCreateInput) => {
      const { data } = await apiClient.post<Branch>("/branches", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
      toast.success("Branch created")
    },
    onError: (error) => {
      toast.error(errorMessage(error))
    },
  })
}
