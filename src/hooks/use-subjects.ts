"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Subject, SubjectCreateInput } from "@/types/gradebook"

export function useSubjects(branchId?: string) {
  return useQuery({
    queryKey: ["subjects", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<Subject[]>("/subjects", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SubjectCreateInput) => {
      const { data } = await apiClient.post<Subject>("/subjects", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] })
      toast.success("Subject created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
