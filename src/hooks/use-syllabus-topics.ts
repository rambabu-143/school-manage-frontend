"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  SyllabusProgressUpdateInput,
  SyllabusTopic,
  SyllabusTopicCreateInput,
} from "@/types/syllabus"

export function useSyllabusTopics(params?: {
  subjectId?: string
  gradeId?: string
  academicYearId?: string
}) {
  return useQuery({
    queryKey: ["syllabus-topics", params],
    queryFn: async () => {
      const { data } = await apiClient.get<SyllabusTopic[]>("/syllabus-topics", {
        params: {
          subject_id: params?.subjectId,
          grade_id: params?.gradeId,
          academic_year_id: params?.academicYearId,
        },
      })
      return data
    },
  })
}

export function useCreateSyllabusTopic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SyllabusTopicCreateInput) => {
      const { data } = await apiClient.post<SyllabusTopic>("/syllabus-topics", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus-topics"] })
      toast.success("Topic created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdateSyllabusProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      topicId,
      input,
    }: {
      topicId: string
      input: SyllabusProgressUpdateInput
    }) => {
      const { data } = await apiClient.put(`/syllabus-topics/${topicId}/progress`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["section-syllabus-coverage"] })
      toast.success("Progress updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
