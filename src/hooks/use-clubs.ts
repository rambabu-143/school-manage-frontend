"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Club, ClubCreateInput } from "@/types/clubs"

export function useClubs(branchId?: string) {
  return useQuery({
    queryKey: ["clubs", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<Club[]>("/clubs", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ClubCreateInput) => {
      const { data } = await apiClient.post<Club>("/clubs", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] })
      toast.success("Club created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
