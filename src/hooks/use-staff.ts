"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Staff, StaffCreateInput, StaffUpdateInput } from "@/types/people"

export function useStaff(branchId?: string) {
  return useQuery({
    queryKey: ["staff", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<Staff[]>("/staff", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: StaffCreateInput) => {
      const { data } = await apiClient.post<Staff>("/staff", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast.success("Staff member created")
    },
    onError: (error) => {
      toast.error(errorMessage(error))
    },
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: StaffUpdateInput }) => {
      const { data } = await apiClient.put<Staff>(`/staff/${id}`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast.success("Staff member updated")
    },
    onError: (error) => {
      toast.error(errorMessage(error))
    },
  })
}

export function useDeleteStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/staff/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast.success("Staff member deleted")
    },
    onError: (error) => {
      toast.error(errorMessage(error))
    },
  })
}
