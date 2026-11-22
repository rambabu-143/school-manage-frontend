"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import type { DashboardSummary, SectionDashboard, StaffAnalytics, SuperAdminDashboard } from "@/types/dashboard"

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

type Range = { start: string; end: string }
const dates = ({ start, end }: Range) => ({ start_date: start, end_date: end })

export function useSuperAdminDashboard(staffId: string | undefined, range: Range, enabled: boolean) {
  return useQuery({
    queryKey: qk("dashboard-super-admin", staffId, range),
    queryFn: async () => (await apiClient.get<SuperAdminDashboard>(`/dashboard/super-admin/${staffId}`, { params: dates(range) })).data,
    enabled: enabled && !!staffId,
  })
}

export function useStaffAnalytics(staffId: string | undefined, range: Range, enabled: boolean) {
  return useQuery({
    queryKey: qk("dashboard-staff-analytics", staffId, range),
    queryFn: async () => (await apiClient.get<StaffAnalytics>(`/dashboard/staff/${staffId}/analytics`, { params: dates(range) })).data,
    enabled: enabled && !!staffId,
  })
}

export function useSectionDashboard(sectionId: string | undefined, range: Range, enabled: boolean) {
  return useQuery({
    queryKey: qk("dashboard-ar-section", sectionId, range),
    queryFn: async () => (await apiClient.get<SectionDashboard>(`/dashboard/student-dashboard-for-ar/${sectionId}`, { params: dates(range) })).data,
    enabled: enabled && !!sectionId,
  })
}
