"use client"

import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { StudentTransport } from "@/types/transport"

export function useStudentTransport(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student-transport", studentId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<StudentTransport>(
          `/students/${studentId}/transport`
        )
        return data
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) return null
        throw error
      }
    },
    enabled: !!studentId,
  })
}

export function useAssignStudentTransport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      studentId,
      routeId,
      stopId,
    }: {
      studentId: string
      routeId: string
      stopId: string
    }) => {
      const { data } = await apiClient.put<StudentTransport>(
        `/students/${studentId}/transport`,
        { route_id: routeId, stop_id: stopId }
      )
      return data
    },
    onSuccess: (_data, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ["student-transport", studentId] })
      toast.success("Transport assigned")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useRemoveStudentTransport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (studentId: string) => {
      await apiClient.delete(`/students/${studentId}/transport`)
    },
    onSuccess: (_data, studentId) => {
      queryClient.invalidateQueries({ queryKey: ["student-transport", studentId] })
      toast.success("Transport assignment removed")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
