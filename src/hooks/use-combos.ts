"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  Combo,
  ComboCreateInput,
  ComboPromotionInput,
  ComboPromotionResult,
  StudentCombo,
  StudentComboAssignInput,
} from "@/types/combo"

export function useCombos(params?: { gradeId?: string; academicYearId?: string }) {
  return useQuery({
    queryKey: ["combos", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Combo[]>("/combos", {
        params: { grade_id: params?.gradeId, academic_year_id: params?.academicYearId },
      })
      return data
    },
  })
}

export function useCreateCombo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ComboCreateInput) => {
      const { data } = await apiClient.post<Combo>("/combos", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["combos"] })
      toast.success("Combo created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useStudentCombo(studentId: string | undefined, academicYearId: string | undefined) {
  return useQuery({
    queryKey: ["student-combo", studentId, academicYearId],
    queryFn: async () => {
      const { data } = await apiClient.get<StudentCombo>(`/students/${studentId}/combo`, {
        params: { academic_year_id: academicYearId },
      })
      return data
    },
    enabled: !!studentId && !!academicYearId,
    retry: false,
  })
}

export function useAssignStudentCombo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      studentId,
      input,
    }: {
      studentId: string
      input: StudentComboAssignInput
    }) => {
      const { data } = await apiClient.put<StudentCombo>(`/students/${studentId}/combo`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-combo"] })
      toast.success("Combo assigned")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function usePromoteComboStudents() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ comboId, input }: { comboId: string; input: ComboPromotionInput }) => {
      const { data } = await apiClient.post<ComboPromotionResult>(
        `/combos/${comboId}/promote`,
        input
      )
      return data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["student-combo"] })
      toast.success(
        `${result.promoted.length} promoted` +
          (result.skipped.length ? `, ${result.skipped.length} skipped` : "")
      )
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
