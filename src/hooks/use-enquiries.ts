"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Enquiry, EnquiryCreateInput, EnquiryStatus } from "@/types/admissions"

export function useEnquiries(params?: { branchId?: string; status?: EnquiryStatus }) {
  return useQuery({
    queryKey: ["enquiries", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Enquiry[]>("/enquiries", {
        params: { branch_id: params?.branchId, status: params?.status },
      })
      return data
    },
  })
}

export function useCreateEnquiry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: EnquiryCreateInput) => {
      const { data } = await apiClient.post<Enquiry>("/enquiries", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] })
      toast.success("Enquiry created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdateEnquiryStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EnquiryStatus }) => {
      const { data } = await apiClient.post<Enquiry>(`/enquiries/${id}/status`, { status })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] })
      toast.success("Enquiry status updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
