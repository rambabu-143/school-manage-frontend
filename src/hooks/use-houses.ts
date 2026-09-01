"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { House, HouseCreateInput, HouseLeaderboard, HouseMember } from "@/types/houses"

export function useHouses(branchId?: string) {
  return useQuery({
    queryKey: ["houses", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<House[]>("/houses", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateHouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: HouseCreateInput) => {
      const { data } = await apiClient.post<House>("/houses", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["houses"] })
      toast.success("House created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useHouseMembers(houseId: string | undefined) {
  return useQuery({
    queryKey: ["houses", houseId, "students"],
    queryFn: async () => {
      const { data } = await apiClient.get<HouseMember[]>(`/houses/${houseId}/students`)
      return data
    },
    enabled: !!houseId,
  })
}

export function useHouseLeaderboard(academicYearId: string | undefined) {
  return useQuery({
    queryKey: ["house-leaderboard", academicYearId],
    queryFn: async () => {
      const { data } = await apiClient.get<HouseLeaderboard>("/houses/leaderboard", {
        params: { academic_year_id: academicYearId },
      })
      return data
    },
    enabled: !!academicYearId,
  })
}
