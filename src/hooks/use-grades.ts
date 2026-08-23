"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Grade, GradeCreateInput } from "@/types/academics"

export function useGrades(branchId?: string) {
  return useQuery({
    queryKey: ["grades", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<Grade[]>("/grades", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateGrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: GradeCreateInput) => {
      const { data } = await apiClient.post<Grade>("/grades", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] })
      toast.success("Grade created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
