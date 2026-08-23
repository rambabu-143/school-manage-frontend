"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { LeaveApplication, LeaveApplicationCreateInput } from "@/types/hr"

export function useLeaveApplications(params?: { staffId?: string; status?: string }) {
  return useQuery({
    queryKey: ["leave-applications", params],
    queryFn: async () => {
      const { data } = await apiClient.get<LeaveApplication[]>("/leave-applications", {
        params: { staff_id: params?.staffId, status: params?.status },
      })
      return data
    },
  })
}

export function useCreateLeaveApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: LeaveApplicationCreateInput) => {
      const { data } = await apiClient.post<LeaveApplication>("/leave-applications", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-applications"] })
      toast.success("Leave application submitted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useApproveLeaveApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) => {
      const { data } = await apiClient.post<LeaveApplication>(
        `/leave-applications/${id}/approve`,
        { review_comment: comment || null }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-applications"] })
      toast.success("Leave approved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useRejectLeaveApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) => {
      const { data } = await apiClient.post<LeaveApplication>(
        `/leave-applications/${id}/reject`,
        { review_comment: comment || null }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-applications"] })
      toast.success("Leave rejected")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
