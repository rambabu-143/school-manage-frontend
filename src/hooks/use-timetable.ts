"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { TimetableEntry, TimetableEntryCreateInput } from "@/types/timetable"

export function useTimetableEntries(params?: { sectionId?: string; staffId?: string }) {
  return useQuery({
    queryKey: ["timetable-entries", params],
    queryFn: async () => {
      const { data } = await apiClient.get<TimetableEntry[]>("/timetable", {
        params: { section_id: params?.sectionId, staff_id: params?.staffId },
      })
      return data
    },
    enabled: !!(params?.sectionId || params?.staffId),
  })
}

export function useCreateTimetableEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TimetableEntryCreateInput) => {
      const { data } = await apiClient.post<TimetableEntry>("/timetable", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable-entries"] })
      toast.success("Class scheduled")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteTimetableEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entryId: string) => {
      await apiClient.delete(`/timetable/${entryId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable-entries"] })
      toast.success("Class removed")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
