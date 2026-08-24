"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { DisciplinaryRecord, DisciplinaryRecordCreateInput } from "@/types/disciplinary"

export function useDisciplinaryRecords(params?: { studentId?: string; status?: string }) {
  return useQuery({
    queryKey: ["disciplinary-records", params],
    queryFn: async () => {
      const { data } = await apiClient.get<DisciplinaryRecord[]>("/disciplinary-records", {
        params: { student_id: params?.studentId, status: params?.status },
      })
      return data
    },
  })
}

export function useCreateDisciplinaryRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: DisciplinaryRecordCreateInput) => {
      const { data } = await apiClient.post<DisciplinaryRecord>("/disciplinary-records", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinary-records"] })
      toast.success("Disciplinary record created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useResolveDisciplinaryRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, actionTaken }: { id: string; actionTaken?: string }) => {
      const { data } = await apiClient.post<DisciplinaryRecord>(
        `/disciplinary-records/${id}/resolve`,
        { action_taken: actionTaken || null }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinary-records"] })
      toast.success("Record resolved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
