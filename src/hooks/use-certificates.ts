"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { CertificateRecord, CertificateRecordCreateInput } from "@/types/certificates"

export function useCertificates(studentId?: string) {
  return useQuery({
    queryKey: ["certificates", { studentId }],
    queryFn: async () => {
      const { data } = await apiClient.get<CertificateRecord[]>("/certificates", {
        params: studentId ? { student_id: studentId } : undefined,
      })
      return data
    },
  })
}

export function useCreateCertificate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CertificateRecordCreateInput) => {
      const { data } = await apiClient.post<CertificateRecord>("/certificates", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] })
      toast.success("Certificate issued")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
