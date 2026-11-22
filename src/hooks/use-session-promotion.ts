"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage } from "@/lib/error-message"
import { qk } from "@/lib/query-keys"
import { api, type ApiBody } from "@/lib/typed-api"

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

// ---- bulk rollovers. Writes are never retried (react-query default for mutations is 0).
function useRollover<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      for (const d of ["session-promotion", "sections", "students", "enrollments", "combos", "houses", "standard-teachers"] as const)
        qc.invalidateQueries({ queryKey: qk(d) })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
}

type Body<P extends Parameters<typeof api>[1]> = ApiBody<P, "post">
export const usePromoteStandard = () =>
  useRollover((body: Body<"/session-promotion/promote-standard">) => api("post", "/session-promotion/promote-standard", { body }))
export const usePromoteSubjects = () =>
  useRollover((body: Body<"/session-promotion/promote-subjects">) => api("post", "/session-promotion/promote-subjects", { body }))
export const usePromoteComboSection = () =>
  useRollover((body: Body<"/session-promotion/promote-combo-section">) => api("post", "/session-promotion/promote-combo-section", { body }))
export const usePromoteHouse = () =>
  useRollover((body: Body<"/session-promotion/promote-house">) => api("post", "/session-promotion/promote-house", { body }))
export const usePromoteStaff = () =>
  useRollover((body: Body<"/session-promotion/promote-staff">) => api("post", "/session-promotion/promote-staff", { body }))
export const useUpdateSibling = () =>
  useRollover((body: Body<"/session-promotion/update-sibling">) => api("post", "/session-promotion/update-sibling", { body }))
export const useChangeSection = () =>
  useRollover((body: Body<"/enrollments/change-section">) => api("post", "/enrollments/change-section", { body }))

export function useSiblingStudents(sectionId?: string) {
  return useQuery({
    queryKey: qk("session-promotion", "siblings", sectionId),
    enabled: !!sectionId,
    queryFn: () => api("get", "/session-promotion/sibling-student-list/{section_id}", { path: { section_id: sectionId! } }),
  })
}
