"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Period, PeriodCreateInput } from "@/types/timetable"

export function usePeriods(branchId?: string) {
  return useQuery({
    queryKey: ["periods", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<Period[]>("/periods", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreatePeriod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: PeriodCreateInput) => {
      const { data } = await apiClient.post<Period>("/periods", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] })
      toast.success("Period created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
