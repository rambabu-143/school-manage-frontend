"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { ConcessionRenewal, ConcessionRenewalUpsertInput } from "@/types/fees"

export function useConcessionRenewals(studentId?: string) {
  return useQuery({
    queryKey: ["concession-renewals", { studentId }],
    queryFn: async () => {
      const { data } = await apiClient.get<ConcessionRenewal[]>("/concession-renewals", {
        params: studentId ? { student_id: studentId } : undefined,
      })
      return data
    },
  })
}

export function useUpsertConcessionRenewal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ConcessionRenewalUpsertInput) => {
      const { data } = await apiClient.post<ConcessionRenewal>("/concession-renewals", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concession-renewals"] })
      toast.success("Case saved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
