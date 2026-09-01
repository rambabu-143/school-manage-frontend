"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  ReportCardReleaseSetting,
  ReportCardReleaseSettingUpsertInput,
} from "@/types/gradebook"

export function useReportCardReleaseSetting(params: {
  branchId?: string
  academicYearId?: string
  gradeId?: string
}) {
  const { branchId, academicYearId, gradeId } = params
  return useQuery({
    queryKey: ["report-card-release-setting", branchId, academicYearId, gradeId],
    queryFn: async () => {
      const { data } = await apiClient.get<ReportCardReleaseSetting>(
        "/report-card-release-settings",
        { params: { branch_id: branchId, academic_year_id: academicYearId, grade_id: gradeId } }
      )
      return data
    },
    enabled: !!branchId && !!academicYearId && !!gradeId,
    retry: false,
  })
}

export function useUpsertReportCardReleaseSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ReportCardReleaseSettingUpsertInput) => {
      const { data } = await apiClient.post<ReportCardReleaseSetting>(
        "/report-card-release-settings",
        input
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-card-release-setting"] })
      toast.success("Release setting saved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
