"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  Shift,
  ShiftCreateInput,
  StaffShiftAssignment,
  StaffShiftAssignmentCreateInput,
} from "@/types/hr"

export function useShifts(branchId?: string) {
  return useQuery({
    queryKey: ["shifts", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<Shift[]>("/shifts", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ShiftCreateInput) => {
      const { data } = await apiClient.post<Shift>("/shifts", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] })
      toast.success("Shift created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useAssignStaffShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: StaffShiftAssignmentCreateInput) => {
      const { data } = await apiClient.post<StaffShiftAssignment>("/shifts/assignments", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] })
      toast.success("Staff assigned to shift")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
