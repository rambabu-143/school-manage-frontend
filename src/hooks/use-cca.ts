"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  CcaActivity,
  CcaActivityCreateInput,
  CcaGradeBulkCreateInput,
  CcaGradeEntry,
  CcaIndicator,
  CcaIndicatorCreateInput,
  CcaReportCard,
} from "@/types/cca"

export function useCcaActivities(branchId?: string) {
  return useQuery({
    queryKey: ["cca-activities", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<CcaActivity[]>("/cca-activities", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateCcaActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CcaActivityCreateInput) => {
      const { data } = await apiClient.post<CcaActivity>("/cca-activities", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cca-activities"] })
      toast.success("Activity created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useCcaIndicators(activityId?: string) {
  return useQuery({
    queryKey: ["cca-indicators", { activityId }],
    queryFn: async () => {
      const { data } = await apiClient.get<CcaIndicator[]>("/cca-indicators", {
        params: { activity_id: activityId },
      })
      return data
    },
    enabled: !!activityId,
  })
}

export function useCreateCcaIndicator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CcaIndicatorCreateInput) => {
      const { data } = await apiClient.post<CcaIndicator>("/cca-indicators", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cca-indicators"] })
      toast.success("Indicator created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useGradeCcaStudents() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CcaGradeBulkCreateInput) => {
      const { data } = await apiClient.post<CcaGradeEntry[]>("/cca-grades", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cca-report-card"] })
      toast.success("Grades saved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useCcaReportCard(studentId?: string, academicYearId?: string) {
  return useQuery({
    queryKey: ["cca-report-card", { studentId, academicYearId }],
    queryFn: async () => {
      const { data } = await apiClient.get<CcaReportCard>(
        `/students/${studentId}/cca-report-card`,
        { params: { academic_year_id: academicYearId } }
      )
      return data
    },
    enabled: !!studentId && !!academicYearId,
  })
}
