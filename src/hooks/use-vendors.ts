"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Vendor, VendorCreateInput } from "@/types/inventory"

export function useVendors(branchId?: string) {
  return useQuery({
    queryKey: ["vendors", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<Vendor[]>("/vendors", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: VendorCreateInput) => {
      const { data } = await apiClient.post<Vendor>("/vendors", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] })
      toast.success("Vendor created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
