"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { CumulativeReport, ReportCard } from "@/types/gradebook"

export function useReportCard(studentId: string | undefined, examId: string | undefined) {
  return useQuery({
    queryKey: ["report-card", studentId, examId],
    queryFn: async () => {
      const { data } = await apiClient.get<ReportCard>(`/students/${studentId}/report-card`, {
        params: { exam_id: examId },
      })
      return data
    },
    enabled: !!studentId && !!examId,
  })
}

export function useCumulativeReport(
  studentId: string | undefined,
  academicYearId: string | undefined
) {
  return useQuery({
    queryKey: ["cumulative-report", studentId, academicYearId],
    queryFn: async () => {
      const { data } = await apiClient.get<CumulativeReport>(
        `/students/${studentId}/cumulative-report`,
        { params: { academic_year_id: academicYearId } }
      )
      return data
    },
    enabled: !!studentId && !!academicYearId,
  })
}
