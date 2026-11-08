"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import type { DashboardSummary } from "@/types/dashboard"

export function useDashboardSummary(branchId?: string) {
  return useQuery({
    queryKey: qk("dashboard-summary", { branchId }),
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardSummary>("/dashboard/summary", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}
