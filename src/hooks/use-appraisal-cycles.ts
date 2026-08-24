"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { AppraisalCycle, AppraisalCycleCreateInput } from "@/types/appraisal"

export function useAppraisalCycles(academicYearId?: string) {
  return useQuery({
    queryKey: ["appraisal-cycles", { academicYearId }],
    queryFn: async () => {
      const { data } = await apiClient.get<AppraisalCycle[]>("/appraisal-cycles", {
        params: academicYearId ? { academic_year_id: academicYearId } : undefined,
      })
      return data
    },
  })
}

export function useCreateAppraisalCycle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AppraisalCycleCreateInput) => {
      const { data } = await apiClient.post<AppraisalCycle>("/appraisal-cycles", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-cycles"] })
      toast.success("Appraisal cycle created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
