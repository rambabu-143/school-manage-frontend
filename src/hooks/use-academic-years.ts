"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { AcademicYear, AcademicYearCreateInput } from "@/types/academics"

export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const { data } = await apiClient.get<AcademicYear[]>("/academic-years")
      return data
    },
  })
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AcademicYearCreateInput) => {
      const { data } = await apiClient.post<AcademicYear>("/academic-years", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] })
      toast.success("Academic year created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
