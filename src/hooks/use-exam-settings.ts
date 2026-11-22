"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import { qk } from "@/lib/query-keys"

export type SettingKind = "grade-settings" | "weightages" | "bluesheet-settings"
const PATH: Record<SettingKind, string> = {
  "grade-settings": "/exam/grade-settings",
  weightages: "/exam/senior/weightages",
  "bluesheet-settings": "/exam/senior/bluesheet-settings",
}

export interface SettingFilters { academic_year_id?: string; grade_id?: string; subject_id?: string }
export interface ExamOption { id: string; exam_name: string }

export function useSettings<T>(kind: SettingKind, filters: SettingFilters) {
  return useQuery({
    queryKey: qk("exam-settings", kind, filters),
    queryFn: async () => (await apiClient.get<T[]>(PATH[kind], { params: filters })).data,
  })
}

/** Senior exam names for a class+year, used to pick the exams a column is built from. */
export function useSeniorExams(gradeId: string, yearId: string) {
  return useQuery({
    queryKey: qk("exam-settings", "exams", gradeId, yearId),
    queryFn: async () => (await apiClient.get<ExamOption[]>("/exam/senior/exam-names", { params: { grade_id: gradeId, academic_year_id: yearId } })).data,
    enabled: !!gradeId && !!yearId,
  })
}

export function useSaveSetting(kind: SettingKind) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: string; body: unknown }) =>
      (id ? await apiClient.put(`${PATH[kind]}/${id}`, body) : await apiClient.post(PATH[kind], body)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk("exam-settings", kind) }); toast.success("Saved") },
    onError: (e) => toast.error(errorMessage(e)),
  })
}

export function useDeleteSetting(kind: SettingKind) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`${PATH[kind]}/${id}`) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk("exam-settings", kind) }); toast.success("Deleted") },
    onError: (e) => toast.error(errorMessage(e)),
  })
}
