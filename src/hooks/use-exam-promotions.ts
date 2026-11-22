"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import { qk } from "@/lib/query-keys"

export function usePromotion(sectionId: string) {
  return useQuery({
    queryKey: qk("exam-promotions", "decisions", sectionId),
    queryFn: async () => (await apiClient.get<unknown>(`/exam/promotions/${sectionId}`)).data,
    enabled: !!sectionId,
  })
}

/** Overwrites the section's whole saved decision list. */
export function useSavePromotion(sectionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: unknown) => (await apiClient.put<unknown>(`/exam/promotions/${sectionId}`, body)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk("exam-promotions") }); toast.success("Promotion decisions saved") },
    onError: (e) => toast.error(errorMessage(e)),
  })
}

export interface StudentMarks {
  student: { student_id: string; admission_number: string; name: string }
  section: { section_id: string; name: string }
  subjects: unknown
  previous_subjects: unknown
}

/** Look a student up by admission number: marks in the current section plus the previous section's marks. */
export function useStudentMarks(admissionNo: string, sectionId: string, previousSectionId: string) {
  return useQuery({
    queryKey: qk("exam-promotions", "student-marks", admissionNo, sectionId, previousSectionId),
    queryFn: async () => (await apiClient.get<StudentMarks>(`/exam/senior/students/by-admission-no/${encodeURIComponent(admissionNo)}/marks`, { params: { section_id: sectionId, previous_section_id: previousSectionId || undefined } })).data,
    enabled: !!admissionNo && !!sectionId,
    retry: false,
  })
}

// Both actions rewrite mark sheets: refresh anything showing marks or reports.
function useMarksMutation(path: string, done: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (a: { body: unknown; params: Record<string, string> }) => (await apiClient.post<Record<string, number>>(path, a.body, { params: a.params })).data,
    onSuccess: (r) => {
      for (const d of ["exam-promotions", "exam-records", "exam-reports"] as const) qc.invalidateQueries({ queryKey: qk(d) })
      toast.success(`${done}: ${Object.values(r)[0] ?? 0} sheet(s)`)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
}
export const useTransferMarks = () => useMarksMutation("/exam/senior/marks/transfer", "Marks transferred")
export const useChangeSectionMarks = () => useMarksMutation("/exam/senior/marks/change-section", "Marks moved")
