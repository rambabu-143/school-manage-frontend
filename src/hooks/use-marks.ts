"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Mark, MarkBulkCreateInput } from "@/types/gradebook"

export function useMarks(params: { examId?: string; subjectId?: string; studentId?: string }) {
  return useQuery({
    queryKey: ["marks", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Mark[]>("/marks", {
        params: {
          exam_id: params.examId,
          subject_id: params.subjectId,
          student_id: params.studentId,
        },
      })
      return data
    },
    enabled: !!params.examId,
  })
}

export function useMarkStudents() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: MarkBulkCreateInput) => {
      const { data } = await apiClient.post<Mark[]>("/marks", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks"] })
      toast.success("Marks saved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
