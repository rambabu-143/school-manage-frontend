"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { invalidateWithDependents } from "@/lib/invalidation"
import { qk } from "@/lib/query-keys"
import { errorMessage } from "@/lib/error-message"
import type { Enrollment } from "@/types/academics"

export function useEnrollments(sectionId: string | undefined) {
  return useQuery({
    queryKey: qk("enrollments", { sectionId }),
    queryFn: async () => {
      const { data } = await apiClient.get<Enrollment[]>("/enrollments", {
        params: { section_id: sectionId },
      })
      return data
    },
    enabled: !!sectionId,
  })
}

export function useEnrollStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { student_id: string; section_id: string }) => {
      const { data } = await apiClient.post<Enrollment>("/enrollments", input)
      return data
    },
    onSuccess: () => {
      invalidateWithDependents(queryClient, "enrollments")
      toast.success("Student enrolled")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useWithdrawEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      await apiClient.delete(`/enrollments/${enrollmentId}`)
    },
    onSuccess: () => {
      invalidateWithDependents(queryClient, "enrollments")
      toast.success("Enrollment withdrawn")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
