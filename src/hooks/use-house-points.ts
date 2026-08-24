"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { HousePoints, HousePointsCreateInput } from "@/types/houses"

export function useHousePoints(params?: { houseId?: string; academicYearId?: string }) {
  return useQuery({
    queryKey: ["house-points", params],
    queryFn: async () => {
      const { data } = await apiClient.get<HousePoints[]>("/house-points", {
        params: { house_id: params?.houseId, academic_year_id: params?.academicYearId },
      })
      return data
    },
  })
}

export function useAwardHousePoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: HousePointsCreateInput) => {
      const { data } = await apiClient.post<HousePoints>("/house-points", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-points"] })
      queryClient.invalidateQueries({ queryKey: ["house-leaderboard"] })
      toast.success("Points awarded")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
