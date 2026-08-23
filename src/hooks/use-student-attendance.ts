"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  StudentAttendanceBulkCreateInput,
  StudentAttendanceRecord,
  StudentAttendanceSummary,
} from "@/types/attendance"

export function useStudentAttendance(params: {
  sectionId?: string
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery({
    queryKey: ["student-attendance", params],
    queryFn: async () => {
      const { data } = await apiClient.get<StudentAttendanceRecord[]>("/attendance/students", {
        params: {
          section_id: params.sectionId,
          date_from: params.dateFrom,
          date_to: params.dateTo,
        },
      })
      return data
    },
    enabled: !!params.sectionId,
  })
}

export function useMarkStudentAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: StudentAttendanceBulkCreateInput) => {
      const { data } = await apiClient.post<StudentAttendanceRecord[]>(
        "/attendance/students",
        input
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-attendance"] })
      queryClient.invalidateQueries({ queryKey: ["section-attendance-summary"] })
      toast.success("Attendance saved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useSectionAttendanceSummary(
  sectionId: string | undefined,
  params: { dateFrom?: string; dateTo?: string }
) {
  return useQuery({
    queryKey: ["section-attendance-summary", sectionId, params],
    queryFn: async () => {
      const { data } = await apiClient.get<StudentAttendanceSummary[]>(
        `/sections/${sectionId}/attendance-summary`,
        { params: { date_from: params.dateFrom, date_to: params.dateTo } }
      )
      return data
    },
    enabled: !!sectionId,
  })
}
