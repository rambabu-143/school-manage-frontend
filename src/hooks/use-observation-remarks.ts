"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { ObservationRemark, ObservationRemarkCreateInput } from "@/types/observations"

export function useObservationRemarks(studentId?: string) {
  return useQuery({
    queryKey: ["observation-remarks", { studentId }],
    queryFn: async () => {
      const { data } = await apiClient.get<ObservationRemark[]>("/observation-remarks", {
        params: studentId ? { student_id: studentId } : undefined,
      })
      return data
    },
  })
}

export function useCreateObservationRemark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ObservationRemarkCreateInput) => {
      const { data } = await apiClient.post<ObservationRemark>("/observation-remarks", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["observation-remarks"] })
      toast.success("Remark added")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
