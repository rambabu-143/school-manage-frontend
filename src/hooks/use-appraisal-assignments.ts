"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { AppraisalAssignment, AppraisalAssignmentCreateInput } from "@/types/appraisal"

export function useAppraisalAssignments(cycleId?: string) {
  return useQuery({
    queryKey: ["appraisal-assignments", { cycleId }],
    queryFn: async () => {
      const { data } = await apiClient.get<AppraisalAssignment[]>("/appraisal-assignments", {
        params: cycleId ? { cycle_id: cycleId } : undefined,
      })
      return data
    },
  })
}

export function useCreateAppraisalAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AppraisalAssignmentCreateInput) => {
      const { data } = await apiClient.post<AppraisalAssignment>(
        "/appraisal-assignments",
        input
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-assignments"] })
      toast.success("Assessor assigned")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
