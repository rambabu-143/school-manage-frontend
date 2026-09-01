"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { HomeworkAssignment, HomeworkAssignmentCreateInput } from "@/types/homework"

export function useHomework(sectionId?: string, subjectId?: string) {
  return useQuery({
    queryKey: ["homework", { sectionId, subjectId }],
    queryFn: async () => {
      const { data } = await apiClient.get<HomeworkAssignment[]>("/homework", {
        params: {
          ...(sectionId ? { section_id: sectionId } : {}),
          ...(subjectId ? { subject_id: subjectId } : {}),
        },
      })
      return data
    },
  })
}

export function useCreateHomework() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: HomeworkAssignmentCreateInput) => {
      const { data } = await apiClient.post<HomeworkAssignment>("/homework", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homework"] })
      toast.success("Homework assigned")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteHomework() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (homeworkId: string) => {
      await apiClient.delete(`/homework/${homeworkId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homework"] })
      toast.success("Homework deleted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useMyChildHomework(studentId: string | undefined) {
  return useQuery({
    queryKey: ["portal", "homework", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<HomeworkAssignment[]>(
        `/me/children/${studentId}/homework`
      )
      return data
    },
    enabled: !!studentId,
  })
}
