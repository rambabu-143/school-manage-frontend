"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { StaffAttendanceCreateInput, StaffAttendanceRecord } from "@/types/attendance"

export function useStaffAttendance(params: { staffId?: string; dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ["staff-attendance", params],
    queryFn: async () => {
      const { data } = await apiClient.get<StaffAttendanceRecord[]>("/attendance/staff", {
        params: {
          staff_id: params.staffId,
          date_from: params.dateFrom,
          date_to: params.dateTo,
        },
      })
      return data
    },
  })
}

export function useMarkStaffAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: StaffAttendanceCreateInput) => {
      const { data } = await apiClient.post<StaffAttendanceRecord>("/attendance/staff", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-attendance"] })
      toast.success("Attendance saved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
