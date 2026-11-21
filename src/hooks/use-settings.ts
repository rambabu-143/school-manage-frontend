"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { api, type ApiBody } from "@/lib/typed-api"
import { qk, SESSION_KEY, type QueryDomain } from "@/lib/query-keys"
import { errorMessage } from "@/lib/error-message"

/** Mutation that toasts and invalidates one domain. */
function useSave<V>(domain: QueryDomain, fn: (v: V) => Promise<unknown>, msg: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast.success(msg)
      qc.invalidateQueries({ queryKey: qk(domain) })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
}

export function useRenameSchool() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api("put", "/tenants/me", { body: { name } }),
    onSuccess: () => {
      toast.success("School renamed")
      // session user carries the tenant; branches list is tenant-scoped too
      qc.invalidateQueries({ queryKey: SESSION_KEY })
      qc.invalidateQueries({ queryKey: qk("branches") })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
}

export function useAppSettings(academicYearId?: string) {
  return useQuery({
    queryKey: qk("app-settings", academicYearId),
    queryFn: () => api("get", "/app-settings", { query: { academic_year_id: academicYearId } }),
    enabled: !!academicYearId,
  })
}
export const useSetAppSetting = () =>
  useSave("app-settings", (b: ApiBody<"/app-settings", "post">) => api("post", "/app-settings", { body: b }), "Setting saved")

export const useAppVersions = () =>
  useQuery({ queryKey: qk("app-versions"), queryFn: () => api("get", "/app-version") })
export const useSetAppVersion = () =>
  useSave("app-versions", (b: ApiBody<"/app-version", "put">) => api("put", "/app-version", { body: b }), "Version saved")

export function useCalendarSettings(branchId?: string, yearId?: string) {
  return useQuery({
    queryKey: qk("calendar-settings", branchId, yearId),
    queryFn: () => api("get", "/calendar-settings", { query: { branch_id: branchId!, academic_year_id: yearId! } }),
    enabled: !!branchId && !!yearId,
  })
}
export const useCreateCalendarSetting = () =>
  useSave("calendar-settings", (b: ApiBody<"/calendar-settings", "post">) => api("post", "/calendar-settings", { body: b }), "Calendar setting created")
export const useDeleteCalendarSetting = () =>
  useSave("calendar-settings", (id: string) => api("delete", "/calendar-settings/{setting_id}", { path: { setting_id: id } }), "Calendar setting deleted")

export function useArSettings(branchId?: string, yearId?: string) {
  return useQuery({
    queryKey: qk("ar-settings", branchId, yearId),
    queryFn: () => api("get", "/ar-settings", { query: { branch_id: branchId!, academic_year_id: yearId! } }),
    enabled: !!branchId && !!yearId,
  })
}
export const useCreateArSetting = () =>
  useSave("ar-settings", (b: ApiBody<"/ar-settings", "post">) => api("post", "/ar-settings", { body: b }), "AR setting created")
export const useToggleArLive = () =>
  useSave("ar-settings", (v: { id: string; live: boolean }) => api("put", "/ar-settings/{setting_id}", { path: { setting_id: v.id }, body: { is_ar_live: v.live } }), "AR setting updated")
export const useDeleteArSetting = () =>
  useSave("ar-settings", (id: string) => api("delete", "/ar-settings/{setting_id}", { path: { setting_id: id } }), "AR setting deleted")

export const useAccessCatalog = () =>
  useQuery({ queryKey: qk("module-access", "catalog"), queryFn: () => api("get", "/module-access/catalog") })
export const useAccessGroups = (yearId?: string) =>
  useQuery({
    queryKey: qk("module-access", "groups", yearId),
    queryFn: () => api("get", "/module-access/access-groups", { query: { academic_year_id: yearId! } }),
    enabled: !!yearId,
  })
