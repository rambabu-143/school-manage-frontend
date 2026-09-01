"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { StaffRating } from "@/types/appraisal"

export function useStaffRatings(cycleId: string | undefined, staffId: string | undefined) {
  return useQuery({
    queryKey: ["staff-ratings", { cycleId, staffId }],
    queryFn: async () => {
      const { data } = await apiClient.get<StaffRating[]>("/staff-ratings", {
        params: { cycle_id: cycleId, staff_id: staffId },
      })
      return data
    },
    enabled: !!cycleId && !!staffId,
  })
}
