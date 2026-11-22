"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import type { RegRow, MarksPayloadRow } from "@/lib/admission-evaluation"

export type Scope = { branchId?: string; yearId?: string }
export type AdmissionRoom = { id: string; grade_id: string; room_no: string; shift: string; phase: number; no_of_student: number; location: string }
export type AdmissionSubject = { id: string; grade_id: string; name: string; short_name: string; extra_subject: boolean; max_marks: number }
export type EvalGrid = { data: RegRow[]; subjects?: AdmissionSubject[] }

const q = (s: Scope) => ({ branch_id: s.branchId, academic_year_id: s.yearId })
const ready = (s: Scope) => !!s.branchId && !!s.yearId

export function useAdmissionRooms(s: Scope, gradeId?: string) {
  return useQuery({
    queryKey: qk("admission-rooms", s, gradeId),
    enabled: ready(s) && !!gradeId,
    queryFn: async () => (await apiClient.get<AdmissionRoom[]>("/admission/setting/room-list", { params: { ...q(s), grade_id: gradeId } })).data,
  })
}

export function useAdmissionSubjects(s: Scope, gradeId?: string) {
  return useQuery({
    queryKey: qk("admission-subjects", s, gradeId),
    enabled: ready(s) && !!gradeId,
    queryFn: async () => (await apiClient.get<AdmissionSubject[]>("/admission/setting/subject-list", { params: { ...q(s), grade_id: gradeId } })).data,
  })
}

/** Read views: marks-entry / reappear-marks-entry / mark-attendance (rows of one room + phase). */
export function useRoomRows(kind: "marks-entry" | "reappear-marks-entry" | "mark-attendance", s: Scope, o: { className?: string; phase: number; roomId?: string; subjectId?: string }) {
  const tail = kind === "mark-attendance" ? "" : `/${o.subjectId}`
  const ok = ready(s) && !!o.className && !!o.roomId && o.phase >= 1 && (kind === "mark-attendance" || !!o.subjectId)
  return useQuery({
    queryKey: qk("admission-evaluation", kind, s, o),
    enabled: ok,
    queryFn: async () => (await apiClient.get<RegRow[]>(`/admission/evaluation/${kind}/${encodeURIComponent(o.className!)}/${o.phase}/${o.roomId}${tail}`, { params: q(s) })).data,
  })
}

export function useAllocationList(s: Scope, o: { className?: string; category: string; gender: string; phase: number }) {
  return useQuery({
    queryKey: qk("admission-evaluation", "allocate-room", s, o),
    enabled: ready(s) && !!o.className && o.phase >= 1,
    queryFn: async () =>
      (await apiClient.get<RegRow[]>(`/admission/allocate-room/${encodeURIComponent(o.className!)}/${o.category}/${o.gender}/${o.phase}`, { params: q(s) })).data,
  })
}

/** Evaluation grid for a class + phase ("other" covers every class but PREP/UKG/NURSERY/XI). */
export function useEvaluationGrid(s: Scope, o: { className?: string; phase: number }) {
  return useQuery({
    queryKey: qk("admission-evaluation", "other", s, o),
    enabled: ready(s) && !!o.className && o.phase >= 1,
    queryFn: async () => (await apiClient.get<EvalGrid>(`/admission/evaluation/other/${encodeURIComponent(o.className!)}/${o.phase}`, { params: q(s) })).data,
  })
}

export function useAbsentees(s: Scope, o: { className?: string; phase: number }) {
  return useQuery({
    queryKey: qk("admission-evaluation", "absent", s, o),
    enabled: ready(s) && !!o.className && o.phase >= 1,
    queryFn: async () => (await apiClient.post<RegRow[]>("/admission/evaluation/absent-details", { class: o.className, phase: o.phase }, { params: q(s) })).data,
  })
}

// Writes: never retried (react-query mutations default to 0 retries) and always invalidate on settle.
function useInvalidate() {
  const client = useQueryClient()
  return () => client.invalidateQueries({ queryKey: qk("admission-evaluation") })
}

export function useSaveMarks(reappear: boolean) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (rows: MarksPayloadRow[]) =>
      (await apiClient.post<{ updated: number; conflicts?: string[] }>(`/admission/evaluation/${reappear ? "reappear-marks-entry" : "marks-entry"}`, rows)).data,
    onSettled: invalidate,
  })
}

export function useMarkAttendance(s: Scope) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (v: { regId: string; body: object }) => (await apiClient.put(`/admission/evaluation/mark-attendance/${v.regId}`, v.body, { params: q(s) })).data,
    onSettled: invalidate,
  })
}

export function useAllocateRoom() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (v: { regId: string; body: { room_id: string; phase: number } }) => (await apiClient.put(`/admission/allocate-room/${v.regId}`, v.body)).data,
    onSettled: invalidate,
  })
}

export function useObservationRemark() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (v: { reg_id: string; remark: string }) => (await apiClient.post("/admission/evaluation/observation-remark", v)).data,
    onSettled: invalidate,
  })
}
