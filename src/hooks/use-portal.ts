"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { StudentAttendanceRecord } from "@/types/attendance"
import type { Invoice } from "@/types/fees"
import type { ReportCard } from "@/types/gradebook"
import type { Student } from "@/types/people"
import type { DisciplinaryRecord } from "@/types/portal"

export function useMyChildren() {
  return useQuery({
    queryKey: ["portal", "children"],
    queryFn: async () => {
      const { data } = await apiClient.get<Student[]>("/me/children")
      return data
    },
  })
}

export function useChildAttendance(
  studentId: string | undefined,
  params: { dateFrom?: string; dateTo?: string }
) {
  return useQuery({
    queryKey: ["portal", "attendance", studentId, params],
    queryFn: async () => {
      const { data } = await apiClient.get<StudentAttendanceRecord[]>(
        `/me/children/${studentId}/attendance`,
        { params: { date_from: params.dateFrom, date_to: params.dateTo } }
      )
      return data
    },
    enabled: !!studentId,
  })
}

export function useChildReportCard(studentId: string | undefined, examId: string | undefined) {
  return useQuery({
    queryKey: ["portal", "report-card", studentId, examId],
    queryFn: async () => {
      const { data } = await apiClient.get<ReportCard>(
        `/me/children/${studentId}/report-card`,
        { params: { exam_id: examId } }
      )
      return data
    },
    enabled: !!studentId && !!examId,
  })
}

export function useChildInvoices(studentId: string | undefined) {
  return useQuery({
    queryKey: ["portal", "invoices", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<Invoice[]>(`/me/children/${studentId}/invoices`)
      return data
    },
    enabled: !!studentId,
  })
}

export function useChildDisciplinaryRecords(studentId: string | undefined) {
  return useQuery({
    queryKey: ["portal", "disciplinary-records", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<DisciplinaryRecord[]>(
        `/me/children/${studentId}/disciplinary-records`
      )
      return data
    },
    enabled: !!studentId,
  })
}
