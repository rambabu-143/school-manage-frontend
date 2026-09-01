"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  SelfNomination,
  SelfNominationCreateInput,
  SelfNominationReview,
  SelfNominationReviewCreateInput,
} from "@/types/selfnomination"

export function useSelfNominations(studentId?: string) {
  return useQuery({
    queryKey: ["self-nominations", { studentId }],
    queryFn: async () => {
      const { data } = await apiClient.get<SelfNomination[]>("/self-nominations", {
        params: studentId ? { student_id: studentId } : undefined,
      })
      return data
    },
  })
}

export function useCreateSelfNomination() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SelfNominationCreateInput) => {
      const { data } = await apiClient.post<SelfNomination>("/self-nominations", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["self-nominations"] })
      toast.success("Nomination created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useNominationReviews(nominationId: string | undefined) {
  return useQuery({
    queryKey: ["nomination-reviews", nominationId],
    queryFn: async () => {
      const { data } = await apiClient.get<SelfNominationReview[]>(
        `/self-nominations/${nominationId}/reviews`
      )
      return data
    },
    enabled: !!nominationId,
  })
}

export function useAddNominationReview(nominationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SelfNominationReviewCreateInput) => {
      const { data } = await apiClient.post<SelfNominationReview>(
        `/self-nominations/${nominationId}/reviews`,
        input
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nomination-reviews", nominationId] })
      toast.success("Review submitted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
