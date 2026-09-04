"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  BillExtractResult,
  PurchaseOrder,
  PurchaseOrderCreateInput,
  PurchaseOrderStatus,
} from "@/types/inventory"

export function usePurchaseOrders(params?: {
  branchId?: string
  vendorId?: string
  status?: PurchaseOrderStatus
}) {
  return useQuery({
    queryKey: ["purchase-orders", params],
    queryFn: async () => {
      const { data } = await apiClient.get<PurchaseOrder[]>("/purchase-orders", {
        params: {
          branch_id: params?.branchId,
          vendor_id: params?.vendorId,
          status: params?.status,
        },
      })
      return data
    },
  })
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: PurchaseOrderCreateInput) => {
      const { data } = await apiClient.post<PurchaseOrder>("/purchase-orders", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      toast.success("Purchase order created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useExtractBill() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const { data } = await apiClient.post<BillExtractResult>(
        "/purchase-orders/extract-bill",
        formData
      )
      return data
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdatePurchaseOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PurchaseOrderStatus }) => {
      const { data } = await apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/status`, {
        status,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      toast.success("Purchase order status updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
