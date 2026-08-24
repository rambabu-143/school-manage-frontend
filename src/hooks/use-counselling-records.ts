"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { CounsellingRecord, CounsellingRecordCreateInput } from "@/types/counselling"

export function useCounsellingRecords(params?: { studentId?: string; status?: string }) {
  return useQuery({
    queryKey: ["counselling-records", params],
    queryFn: async () => {
      const { data } = await apiClient.get<CounsellingRecord[]>("/counselling-records", {
        params: { student_id: params?.studentId, status: params?.status },
      })
      return data
    },
  })
}

export function useCreateCounsellingRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CounsellingRecordCreateInput) => {
      const { data } = await apiClient.post<CounsellingRecord>("/counselling-records", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselling-records"] })
      toast.success("Counselling record created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useCloseCounsellingRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<CounsellingRecord>(
        `/counselling-records/${id}/close`
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselling-records"] })
      toast.success("Record closed")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
