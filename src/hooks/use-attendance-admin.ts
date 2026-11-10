"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { api, type ApiBody } from "@/lib/typed-api"
import { qk, type QueryDomain } from "@/lib/query-keys"
import { useApiError } from "@/hooks/shared/use-api-error"

// Reads for school days, terms, transport attendance, calendar, birthday wishes, CATS.

export function useSchoolDays(q: { grade_id?: string; date_from?: string; date_to?: string }) {
  return useQuery({
    queryKey: qk("school-days", q),
    queryFn: () => api("get", "/attendance/school-days", { query: { grade_id: q.grade_id!, date_from: q.date_from!, date_to: q.date_to! } }),
    enabled: !!q.grade_id && !!q.date_from && !!q.date_to,
  })
}

export function useTerms(academic_year_id?: string) {
  return useQuery({
    queryKey: qk("attendance-terms", academic_year_id),
    queryFn: () => api("get", "/attendance/terms", { query: { academic_year_id: academic_year_id! } }),
    enabled: !!academic_year_id,
  })
}

export function useTermAttendance(sectionId?: string, term?: number, tillCurrent = false) {
  return useQuery({
    queryKey: qk("attendance-terms", "attendance", sectionId, term, tillCurrent),
    queryFn: () =>
      api("get", "/attendance/term-attendance/{section_id}/{term_session}", {
        path: { section_id: sectionId!, term_session: term! },
        query: { till_current_date: tillCurrent },
      }),
    enabled: !!sectionId && !!term,
  })
}

export function useTransportAttendance(q: { grade_id?: string; section_id?: string; date_from?: string; date_to?: string }) {
  return useQuery({
    queryKey: qk("transport-attendance", q),
    queryFn: () => api("get", "/attendance/transport", { query: q }),
    enabled: !!(q.grade_id || q.section_id) && !!q.date_from && !!q.date_to,
  })
}

export function useAttendanceReasons() {
  return useQuery({ queryKey: qk("attendance-reasons"), queryFn: () => api("get", "/attendance-reasons") })
}

export function useCalendarEvents(q: { branch_id?: string; academic_year_id?: string; page: number; limit: number }) {
  return useQuery({
    queryKey: qk("calendar-events", q),
    queryFn: () =>
      api("get", "/school-calendar/all", {
        query: { branch_id: q.branch_id, academic_year_id: q.academic_year_id, limit: q.limit, offset: (q.page - 1) * q.limit },
      }),
    placeholderData: keepPreviousData,
  })
}

export function useCalendarHolidays(q: { grade_id?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: qk("calendar-holidays", q),
    queryFn: () => api("get", "/school-calendar/holidays", { query: { grade_id: q.grade_id, from: q.from, to: q.to, limit: 500 } }),
  })
}

export function useBirthdayWishes(q: { page: number; limit: number }) {
  return useQuery({
    queryKey: qk("birthday-wishes", q),
    queryFn: () => api("get", "/birthday-wishes", { query: { limit: q.limit, offset: (q.page - 1) * q.limit } }),
    placeholderData: keepPreviousData,
  })
}

export function useCatsUnits() {
  return useQuery({ queryKey: qk("cats-reports", "units"), queryFn: () => api("get", "/hr/cats-reports/unit-master/all", { query: { limit: 500 } }) })
}

export function useCatsLeaves() {
  return useQuery({ queryKey: qk("cats-reports", "leaves"), queryFn: () => api("get", "/hr/cats-reports/leave-master/all", { query: { limit: 500 } }) })
}

export function useMachineAllData(day?: string) {
  return useQuery({
    queryKey: qk("cats-reports", "machine", day),
    queryFn: () => api("get", "/hr/machine-attendance/all-data/{day}", { path: { day: day! }, query: { limit: 200 } }),
    enabled: !!day,
  })
}

/** Generic save mutation: toasts, maps 422 onto the form, invalidates `domain`. */
export function useSave<T>(domain: QueryDomain, run: (v: T) => Promise<unknown>, okMsg: string, onDone?: () => void) {
  const qc = useQueryClient()
  const { handle } = useApiError()
  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      toast.success(okMsg)
      qc.invalidateQueries({ queryKey: qk(domain) })
      onDone?.()
    },
    onError: (e) => handle(e),
  })
}

export type SchoolDaySetBody = ApiBody<"/attendance/school-days", "post">
export type TermCreateBody = ApiBody<"/attendance/terms", "post">
export type CalendarCreateBody = ApiBody<"/school-calendar", "post">
export type WishCreateBody = ApiBody<"/birthday-wishes", "post">
