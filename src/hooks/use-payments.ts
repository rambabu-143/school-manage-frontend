"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  PaymentGatewayConfig,
  PaymentGatewayConfigUpdateInput,
  PaymentOrder,
  PaymentOrderCreateInput,
  PaymentOrderCreateResponse,
  PaymentOrderVerifyInput,
} from "@/types/payments"

export function usePaymentGatewayConfig() {
  return useQuery({
    queryKey: ["payment-gateway-config"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<PaymentGatewayConfig>("/payment-gateway-config")
        return data
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status === 404
        ) {
          return null
        }
        throw error
      }
    },
  })
}

export function useSetPaymentGatewayConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: PaymentGatewayConfigUpdateInput) => {
      const { data } = await apiClient.put<PaymentGatewayConfig>("/payment-gateway-config", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-gateway-config"] })
      toast.success("Payment gateway settings saved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: async (input: PaymentOrderCreateInput) => {
      const { data } = await apiClient.post<PaymentOrderCreateResponse>("/payment-orders", input)
      return data
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useVerifyPaymentOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, ...input }: PaymentOrderVerifyInput & { orderId: string }) => {
      const { data } = await apiClient.post<PaymentOrder>(
        `/payment-orders/${orderId}/verify`,
        input
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal", "invoices"] })
      toast.success("Payment successful")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
