"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import { qk } from "@/lib/query-keys"

export interface ChainStep {
  id: string
  approver_user_id: string
  sort_order: number
  role_id: string | null
}

export function useRequisitionChain(requesterId?: string) {
  return useQuery({
    queryKey: qk("requisition-chain", requesterId),
    enabled: !!requesterId,
    queryFn: async () => {
      const { data } = await apiClient.get<ChainStep[]>(`/requisition-approvers/${requesterId}/chain`)
      return data
    },
  })
}

/** PUT replaces the requester's whole chain. */
export function useSetRequisitionChain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ requesterId, approvers }: { requesterId: string; approvers: { approver_user_id: string; role_id: string | null }[] }) => {
      const { data } = await apiClient.put<ChainStep[]>(`/requisition-approvers/${requesterId}/chain`, {
        approvers: approvers.map(({ approver_user_id, role_id }) => ({ approver_user_id, ...(role_id ? { role_id } : {}) })),
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk("requisition-chain") })
      qc.invalidateQueries({ queryKey: qk("ops", "requisition-approvers") })
      toast.success("Approval chain saved")
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
}

/** Whole-requester DELETE: removes every step (PUT cannot send an empty chain). */
export function useClearRequisitionChain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (requesterId: string) => {
      await apiClient.delete(`/requisition-approvers/${requesterId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk("requisition-chain") })
      qc.invalidateQueries({ queryKey: qk("ops", "requisition-approvers") })
      toast.success("Approval chain cleared")
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
}
