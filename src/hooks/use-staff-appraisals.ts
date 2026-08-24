"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { StaffAppraisal, StaffAppraisalCreateInput } from "@/types/appraisal"

export function useStaffAppraisals(params?: { staffId?: string; cycleId?: string }) {
  return useQuery({
    queryKey: ["staff-appraisals", params],
    queryFn: async () => {
      const { data } = await apiClient.get<StaffAppraisal[]>("/staff-appraisals", {
        params: { staff_id: params?.staffId, cycle_id: params?.cycleId },
      })
      return data
    },
  })
}

export function useCreateStaffAppraisal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: StaffAppraisalCreateInput) => {
      const { data } = await apiClient.post<StaffAppraisal>("/staff-appraisals", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-appraisals"] })
      toast.success("Appraisal created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useSubmitStaffAppraisal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<StaffAppraisal>(`/staff-appraisals/${id}/submit`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-appraisals"] })
      toast.success("Appraisal submitted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useAcknowledgeStaffAppraisal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<StaffAppraisal>(`/staff-appraisals/${id}/acknowledge`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-appraisals"] })
      toast.success("Appraisal acknowledged")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
