"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { SelfAwarenessForm, SelfAwarenessFormInput } from "@/types/selfawareness"

export function useSelfAwarenessForms() {
  return useQuery({
    queryKey: ["self-awareness-forms"],
    queryFn: async () => {
      const { data } = await apiClient.get<SelfAwarenessForm[]>("/self-awareness-forms")
      return data
    },
  })
}

export function useSelfAwarenessForm(studentId: string | undefined) {
  return useQuery({
    queryKey: ["self-awareness-forms", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<SelfAwarenessForm | null>(
        `/self-awareness-forms/${studentId}`
      )
      return data
    },
    enabled: !!studentId,
  })
}

export function useUpsertSelfAwarenessForm(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SelfAwarenessFormInput) => {
      const { data } = await apiClient.put<SelfAwarenessForm>(
        `/self-awareness-forms/${studentId}`,
        input
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["self-awareness-forms"] })
      toast.success("Form saved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
