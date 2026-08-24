"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { StreamSelection, StreamSelectionCreateInput } from "@/types/streams"

export function useStreamSelections(params: { studentId?: string; academicYearId?: string }) {
  return useQuery({
    queryKey: ["stream-selections", params],
    queryFn: async () => {
      const { data } = await apiClient.get<StreamSelection[]>("/stream-selections", {
        params: { student_id: params.studentId, academic_year_id: params.academicYearId },
      })
      return data
    },
    enabled: !!params.studentId && !!params.academicYearId,
  })
}

export function useCreateStreamSelection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: StreamSelectionCreateInput) => {
      const { data } = await apiClient.post<StreamSelection>("/stream-selections", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stream-selections"] })
      toast.success("Stream selection created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdateStreamSelection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, combinationId }: { id: string; combinationId: string }) => {
      const { data } = await apiClient.put<StreamSelection>(`/stream-selections/${id}`, {
        combination_id: combinationId,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stream-selections"] })
      toast.success("Stream selection updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useSetStreamSelectionLocked() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, locked }: { id: string; locked: boolean }) => {
      const { data } = await apiClient.post<StreamSelection>(
        `/stream-selections/${id}/${locked ? "lock" : "unlock"}`
      )
      return data
    },
    onSuccess: (selection) => {
      queryClient.invalidateQueries({ queryKey: ["stream-selections"] })
      toast.success(selection.is_locked ? "Selection locked" : "Selection unlocked")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
