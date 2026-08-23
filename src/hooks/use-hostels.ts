"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Hostel, HostelCreateInput } from "@/types/hostel"

export function useHostels(branchId?: string) {
  return useQuery({
    queryKey: ["hostels", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<Hostel[]>("/hostels", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
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
      queryClient.invalidateQueries({ queryKey: ["hostels"] })
      toast.success("Hostel created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
