"use client"

import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { HouseMembership } from "@/types/houses"

export function useStudentHouse(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student-house", studentId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<HouseMembership>(`/students/${studentId}/house`)
        return data
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) return null
        throw error
      }
    },
    enabled: !!studentId,
  })
}

export function useAssignStudentHouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ studentId, houseId }: { studentId: string; houseId: string }) => {
      const { data } = await apiClient.put<HouseMembership>(`/students/${studentId}/house`, {
        house_id: houseId,
      })
      return data
    },
    onSuccess: (_data, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ["student-house", studentId] })
      toast.success("House assigned")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
