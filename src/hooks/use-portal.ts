"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import type { StudentAttendanceRecord } from "@/types/attendance"
import type { Invoice } from "@/types/fees"
import type { ReportCard } from "@/types/gradebook"
import type { ObservationRemark } from "@/types/observations"
import type { Student } from "@/types/people"
import type { DisciplinaryRecord } from "@/types/portal"

export function useMyChildren() {
  return useQuery({
    queryKey: qk("portal", "children"),
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
    queryKey: qk("portal", "attendance", studentId, params),
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
    queryKey: qk("portal", "report-card", studentId, examId),
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
    queryKey: qk("portal", "invoices", studentId),
    queryFn: async () => {
      const { data } = await apiClient.get<Invoice[]>(`/me/children/${studentId}/invoices`)
      return data
    },
    enabled: !!studentId,
  })
}

export function useChildDisciplinaryRecords(studentId: string | undefined) {
  return useQuery({
    queryKey: qk("portal", "disciplinary-records", studentId),
    queryFn: async () => {
      const { data } = await apiClient.get<DisciplinaryRecord[]>(
        `/me/children/${studentId}/disciplinary-records`
      )
      return data
    },
    enabled: !!studentId,
  })
}

export function useChildObservationRemarks(studentId: string | undefined) {
  return useQuery({
    queryKey: qk("portal", "observation-remarks", studentId),
    queryFn: async () => {
      const { data } = await apiClient.get<ObservationRemark[]>(
        `/me/children/${studentId}/observation-remarks`
      )
      return data
    },
    enabled: !!studentId,
  })
}
