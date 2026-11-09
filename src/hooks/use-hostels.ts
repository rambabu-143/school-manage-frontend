"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import { errorMessage } from "@/lib/error-message"
import type { Hostel, HostelCreateInput, HostelOccupant } from "@/types/hostel"

export function useHostels(branchId?: string) {
  return useQuery({
    queryKey: qk("hostels", { branchId }),
    queryFn: async () => {
      const { data } = await apiClient.get<Hostel[]>("/hostels", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useHostelOccupants(hostelId: string | undefined) {
  return useQuery({
    queryKey: qk("hostels", hostelId, "occupants"),
    queryFn: async () => {
      const { data } = await apiClient.get<HostelOccupant[]>(`/hostels/${hostelId}/occupants`)
      return data
    },
    enabled: !!hostelId,
  })
}

export function useCreateHostel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: HostelCreateInput) => {
      const { data } = await apiClient.post<Hostel>("/hostels", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk("hostels") })
      toast.success("Hostel created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
