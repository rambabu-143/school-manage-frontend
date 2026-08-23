"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Concession, ConcessionCreateInput } from "@/types/fees"

export function useConcessions(params?: { studentId?: string; academicYearId?: string }) {
  return useQuery({
    queryKey: ["concessions", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Concession[]>("/concessions", {
        params: { student_id: params?.studentId, academic_year_id: params?.academicYearId },
      })
      return data
    },
  })
}

export function useCreateConcession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ConcessionCreateInput) => {
      const { data } = await apiClient.post<Concession>("/concessions", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concessions"] })
      toast.success("Concession created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useRevokeConcession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<Concession>(`/concessions/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concessions"] })
      toast.success("Concession revoked")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
