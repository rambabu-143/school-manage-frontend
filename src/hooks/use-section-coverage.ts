"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { SectionCoverage } from "@/types/syllabus"

export function useSectionCoverage(sectionId: string | undefined, subjectId: string | undefined) {
  return useQuery({
    queryKey: ["section-syllabus-coverage", sectionId, subjectId],
    queryFn: async () => {
      const { data } = await apiClient.get<SectionCoverage>(
        `/sections/${sectionId}/syllabus-coverage`,
        { params: { subject_id: subjectId } }
      )
      return data
    },
    enabled: !!sectionId && !!subjectId,
  })
}
