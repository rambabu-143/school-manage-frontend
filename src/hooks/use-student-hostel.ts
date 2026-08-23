"use client"

import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { HostelAllocation } from "@/types/hostel"

export function useStudentHostel(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student-hostel", studentId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<HostelAllocation>(`/students/${studentId}/hostel`)
        return data
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) return null
        throw error
      }
    },
    enabled: !!studentId,
  })
}

export function useAssignStudentHostel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      studentId,
      roomId,
      bedNumber,
    }: {
      studentId: string
      roomId: string
      bedNumber?: number
    }) => {
      const { data } = await apiClient.put<HostelAllocation>(`/students/${studentId}/hostel`, {
        room_id: roomId,
        bed_number: bedNumber ?? null,
      })
      return data
    },
    onSuccess: (_data, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ["student-hostel", studentId] })
      toast.success("Hostel room assigned")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useRemoveStudentHostel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (studentId: string) => {
      await apiClient.delete(`/students/${studentId}/hostel`)
    },
    onSuccess: (_data, studentId) => {
      queryClient.invalidateQueries({ queryKey: ["student-hostel", studentId] })
      toast.success("Hostel allocation removed")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
