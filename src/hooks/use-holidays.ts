"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import { errorMessage } from "@/lib/error-message"
import type { Holiday, HolidayCreateInput } from "@/types/holidays"

export function useHolidays(branchId?: string) {
  return useQuery({
    queryKey: qk("holidays", { branchId }),
    queryFn: async () => {
      const { data } = await apiClient.get<Holiday[]>("/holidays", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateHoliday() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: HolidayCreateInput) => {
      const { data } = await apiClient.post<Holiday>("/holidays", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk("holidays") })
      toast.success("Holiday added")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
