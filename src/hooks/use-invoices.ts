"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Invoice, InvoiceCreateInput, Payment, PaymentCreateInput } from "@/types/fees"

export function useInvoices(params?: {
  studentId?: string
  academicYearId?: string
  status?: string
}) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Invoice[]>("/invoices", {
        params: {
          student_id: params?.studentId,
          academic_year_id: params?.academicYearId,
          status: params?.status,
        },
      })
      return data
    },
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: InvoiceCreateInput) => {
      const { data } = await apiClient.post<Invoice>("/invoices", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      toast.success("Invoice created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function usePayments(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["payments", invoiceId],
    queryFn: async () => {
      const { data } = await apiClient.get<Payment[]>(`/invoices/${invoiceId}/payments`)
      return data
    },
    enabled: !!invoiceId,
  })
}

export function useRecordPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      invoiceId,
      input,
    }: {
      invoiceId: string
      input: PaymentCreateInput
    }) => {
      const { data } = await apiClient.post<Payment>(`/invoices/${invoiceId}/payments`, input)
      return data
    },
    onSuccess: (_payment, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ["payments", invoiceId] })
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      toast.success("Payment recorded")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
