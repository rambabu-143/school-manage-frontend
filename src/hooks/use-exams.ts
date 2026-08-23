"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Exam, ExamCreateInput } from "@/types/gradebook"

export function useExams(academicYearId?: string) {
  return useQuery({
    queryKey: ["exams", { academicYearId }],
    queryFn: async () => {
      const { data } = await apiClient.get<Exam[]>("/exams", {
        params: academicYearId ? { academic_year_id: academicYearId } : undefined,
      })
      return data
    },
  })
}

export function useCreateExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ExamCreateInput) => {
      const { data } = await apiClient.post<Exam>("/exams", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] })
      toast.success("Exam created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useSetExamLocked() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ examId, locked }: { examId: string; locked: boolean }) => {
      const { data } = await apiClient.post<Exam>(`/exams/${examId}/${locked ? "lock" : "unlock"}`)
      return data
    },
    onSuccess: (exam) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] })
      toast.success(exam.is_locked ? "Exam locked" : "Exam unlocked")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
