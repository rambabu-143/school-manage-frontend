"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage } from "@/lib/error-message"
import { qk } from "@/lib/query-keys"
import { api } from "@/lib/typed-api"

export function usePromotionStudents(sectionId?: string) {
  return useQuery({
    queryKey: qk("session-promotion", "students", sectionId),
    enabled: !!sectionId,
    queryFn: () =>
      api("get", "/session-promotion/sections/{section_id}/students", { path: { section_id: sectionId! } }),
  })
}

export function usePromotionSlip(sectionId?: string) {
  return useQuery({
    queryKey: qk("promotion-slip", sectionId),
    enabled: !!sectionId,
    queryFn: () => api("get", "/promotion-slip/sections/{section_id}", { path: { section_id: sectionId! } }),
  })
}

export function usePromoteStudentsSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { source_academic_year_id: string; target_section_id: string; student_ids: string[] }) =>
      api("post", "/session-promotion/promote-students", { body }),
    onSuccess: (r) => {
      for (const d of ["session-promotion", "promotion-slip", "students", "enrollments"] as const)
        qc.invalidateQueries({ queryKey: qk(d) })
      if (r.skipped.length) toast.warning(`Promoted ${r.promoted.length}, skipped ${r.skipped.length}`)
      else toast.success(`Promoted ${r.promoted.length} student(s)`)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
}

export function useDemoteStudents() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { academic_year_id: string; student_ids: string[] }) =>
      api("post", "/session-promotion/demote-students", { body: body }),
    onSuccess: () => {
      for (const d of ["session-promotion", "promotion-slip", "students", "enrollments"] as const)
        qc.invalidateQueries({ queryKey: qk(d) })
      toast.success("Students demoted")
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
}
