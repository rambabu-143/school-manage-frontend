"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { PromotionResult, Section, SectionCreateInput } from "@/types/academics"

export function useSections(params?: { gradeId?: string; academicYearId?: string }) {
  return useQuery({
    queryKey: ["sections", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Section[]>("/sections", {
        params: {
          grade_id: params?.gradeId,
          academic_year_id: params?.academicYearId,
        },
      })
      return data
    },
  })
}

export function useCreateSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SectionCreateInput) => {
      const { data } = await apiClient.post<Section>("/sections", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] })
      toast.success("Section created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function usePromoteStudents() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sectionId,
      studentIds,
      targetSectionId,
    }: {
      sectionId: string
      studentIds: string[]
      targetSectionId: string
    }) => {
      const { data } = await apiClient.post<PromotionResult>(
        `/sections/${sectionId}/promote`,
        { student_ids: studentIds, target_section_id: targetSectionId }
      )
      return data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] })
      if (result.skipped.length > 0) {
        toast.warning(
          `Promoted ${result.promoted.length}, skipped ${result.skipped.length}`,
          { description: result.skipped.map((s) => s.reason).join("; ") }
        )
      } else {
        toast.success(`Promoted ${result.promoted.length} student(s)`)
      }
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
