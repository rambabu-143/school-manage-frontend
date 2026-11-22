"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { ReportRequest } from "@/lib/exam-reports"
import { qk } from "@/lib/query-keys"

export function useExamReport(req: ReportRequest | null) {
  return useQuery({
    queryKey: qk("exam-reports", req?.path, req?.params),
    queryFn: async () => (await apiClient.get<unknown>(req!.path, { params: req!.params })).data,
    enabled: !!req,
    retry: false,
  })
}

export function useApproveBluesheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (a: { path: string; body: unknown }) => (await apiClient.post(a.path, a.body)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk("exam-reports") })
      toast.success("Bluesheet approved")
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
}
