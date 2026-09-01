"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { DatesheetEntry, DatesheetEntryCreateInput } from "@/types/datesheet"

export function useDatesheetEntries(params?: { examId?: string; sectionId?: string }) {
  return useQuery({
    queryKey: ["datesheet-entries", params],
    queryFn: async () => {
      const { data } = await apiClient.get<DatesheetEntry[]>("/datesheet", {
        params: { exam_id: params?.examId, section_id: params?.sectionId },
      })
      return data
    },
    enabled: !!(params?.examId || params?.sectionId),
  })
}

export function useCreateDatesheetEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: DatesheetEntryCreateInput) => {
      const { data } = await apiClient.post<DatesheetEntry>("/datesheet", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datesheet-entries"] })
      toast.success("Datesheet entry added")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteDatesheetEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entryId: string) => {
      await apiClient.delete(`/datesheet/${entryId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datesheet-entries"] })
      toast.success("Datesheet entry removed")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
