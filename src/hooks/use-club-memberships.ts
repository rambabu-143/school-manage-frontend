"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { ClubMembership, ClubMembershipCreateInput } from "@/types/clubs"

export function useClubMemberships(params?: { clubId?: string; studentId?: string }) {
  return useQuery({
    queryKey: ["club-memberships", params],
    queryFn: async () => {
      const { data } = await apiClient.get<ClubMembership[]>("/club-memberships", {
        params: { club_id: params?.clubId, student_id: params?.studentId },
      })
      return data
    },
    enabled: !!(params?.clubId || params?.studentId),
  })
}

export function useAddClubMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ClubMembershipCreateInput) => {
      const { data } = await apiClient.post<ClubMembership>("/club-memberships", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-memberships"] })
      toast.success("Member added")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useRemoveClubMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (membershipId: string) => {
      await apiClient.delete(`/club-memberships/${membershipId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-memberships"] })
      toast.success("Member removed")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
