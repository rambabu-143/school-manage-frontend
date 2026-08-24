"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Requisition, RequisitionCreateInput } from "@/types/inventory"

export function useRequisitions(params?: { branchId?: string; status?: string }) {
  return useQuery({
    queryKey: ["requisitions", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Requisition[]>("/requisitions", {
        params: { branch_id: params?.branchId, status: params?.status },
      })
      return data
    },
  })
}

export function useCreateRequisition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RequisitionCreateInput) => {
      const { data } = await apiClient.post<Requisition>("/requisitions", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] })
      toast.success("Requisition submitted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

function useRequisitionAction(action: "approve" | "reject" | "fulfill", successMessage: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<Requisition>(`/requisitions/${id}/${action}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] })
      toast.success(successMessage)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useApproveRequisition() {
  return useRequisitionAction("approve", "Requisition approved")
}

export function useRejectRequisition() {
  return useRequisitionAction("reject", "Requisition rejected")
}

export function useFulfillRequisition() {
  return useRequisitionAction("fulfill", "Requisition fulfilled")
}
