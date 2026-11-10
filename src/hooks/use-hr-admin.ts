"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useApiError } from "@/hooks/shared/use-api-error"
import { api, type ApiBody } from "@/lib/typed-api"
import { qk, type QueryDomain } from "@/lib/query-keys"
import type { Row } from "@/lib/hr/rows"

/** Mutation that toasts API errors (422/403/409/429 mapped) and invalidates the given domains. */
export function useAct<V, R>(fn: (v: V) => Promise<R>, domains: QueryDomain[], success?: string) {
  const qc = useQueryClient()
  const { handle } = useApiError()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      domains.forEach((d) => qc.invalidateQueries({ queryKey: qk(d) }))
      if (success) toast.success(success)
    },
    onError: (e) => {
      handle(e)
    },
  })
}

// ---- reads
export const useHrDashboard = (branch_id?: string) =>
  useQuery({ queryKey: qk("hr-dashboard", { branch_id }), queryFn: () => api("get", "/hr/dashboard", { query: { branch_id } }) })
export const useLeaveTypes = () =>
  useQuery({ queryKey: qk("leave-types"), queryFn: () => api("get", "/leave-types") })
export const useStaffGrades = (academic_year_id?: string) =>
  useQuery({ queryKey: qk("staff-grades", { academic_year_id }), queryFn: () => api("get", "/staff-grades", { query: { academic_year_id } }) })
export const useLeaveRoles = (academic_year_id?: string) =>
  useQuery({
    queryKey: qk("leave-roles", { academic_year_id }),
    queryFn: () => api("get", "/hr/role-management/roles", { query: { academic_year_id: academic_year_id! } }),
    enabled: !!academic_year_id,
  })
export const useRoleAssignments = (academic_year_id?: string, branch_id?: string) =>
  useQuery({
    queryKey: qk("leave-role-assignments", { academic_year_id, branch_id }),
    queryFn: () => api("get", "/hr/role-management/all", { query: { academic_year_id: academic_year_id!, branch_id } }),
    enabled: !!academic_year_id,
  })
export const useEmployeeMaster = (q: { search?: string; branch_id?: string; department_id?: string }) =>
  useQuery({ queryKey: qk("employee-master", q), queryFn: () => api("get", "/hr/employee-master", { query: q }) })
export const useFlexiMasters = (academic_year_id?: string) =>
  useQuery({ queryKey: qk("flexi-shift-masters", { academic_year_id }), queryFn: () => api("get", "/hr/flexi-shift-masters", { query: { academic_year_id } }) })
export const useFlexiSchedules = (shift_id?: string) =>
  useQuery({ queryKey: qk("flexi-shifts", { shift_id }), queryFn: () => api("get", "/hr/flexi-shifts", { query: { shift_id } }) })
export const useStaffLeaveBalances = (staff_id?: string, academic_year_id?: string) =>
  useQuery({
    queryKey: qk("leave-balances", { staff_id, academic_year_id }),
    queryFn: () => api("get", "/hr/staff-leaves/{staff_id}", { path: { staff_id: staff_id! }, query: { academic_year_id: academic_year_id! } }),
    enabled: !!staff_id && !!academic_year_id,
  })
export const useLeaveApplicationsAdmin = (q: { staff_id?: string; status?: string }) =>
  useQuery({ queryKey: qk("leave-applications", { admin: q }), queryFn: () => api("get", "/leave-applications", { query: q }) })

// ---- leave types / grades / roles / approvers
type LeaveTypeBody = ApiBody<"/leave-types", "post">
export const useSaveLeaveType = () =>
  useAct(
    ({ id, body }: { id?: string; body: LeaveTypeBody }) =>
      id ? api("put", "/leave-types/{leave_type_id}", { path: { leave_type_id: id }, body }) : api("post", "/leave-types", { body }),
    ["leave-types"], "Leave type saved")
export const useDeleteLeaveType = () =>
  useAct((id: string) => api("delete", "/leave-types/{leave_type_id}", { path: { leave_type_id: id } }), ["leave-types"], "Leave type deleted")

type GradeBody = ApiBody<"/staff-grades", "post">
export const useSaveStaffGrade = () =>
  useAct(
    ({ id, body }: { id?: string; body: GradeBody }) =>
      id ? api("put", "/staff-grades/{staff_grade_id}", { path: { staff_grade_id: id }, body }) : api("post", "/staff-grades", { body }),
    ["staff-grades"], "Staff grade saved")
export const useDeleteStaffGrade = () =>
  useAct((id: string) => api("delete", "/staff-grades/{staff_grade_id}", { path: { staff_grade_id: id } }), ["staff-grades"], "Staff grade deleted")
export const usePromoteGrades = () =>
  useAct((body: ApiBody<"/staff-grades/promote", "post">) => api("post", "/staff-grades/promote", { body }), ["staff-grades", "employee-master"], "Promotion complete")
export const useAssignGrade = () =>
  useAct((body: ApiBody<"/staff-grades/assignments", "post">) => api("post", "/staff-grades/assignments", { body }), ["employee-master"], "Grade assigned")

export const useSaveLeaveRole = () =>
  useAct(
    ({ id, body }: { id?: string; body: ApiBody<"/hr/role-management/roles", "post"> }) =>
      id
        ? api("put", "/hr/role-management/roles/{role_id}", { path: { role_id: id }, body: { name: body.name, short_name: body.short_name, order: body.order } })
        : api("post", "/hr/role-management/roles", { body }),
    ["leave-roles"], "Leave role saved")
export const useDeleteLeaveRole = () =>
  useAct((id: string) => api("delete", "/hr/role-management/roles/{role_id}", { path: { role_id: id } }), ["leave-roles", "leave-role-assignments"], "Leave role deleted")
export const useAssignRole = () =>
  useAct((body: ApiBody<"/hr/role-management", "put">) => api("put", "/hr/role-management", { body }), ["leave-role-assignments"], "Role assigned")
export const useUnassignRole = () =>
  useAct(
    (v: { staff_id: string; leave_role_id: string }) => api("delete", "/hr/role-management/{staff_id}/{leave_role_id}", { path: v }),
    ["leave-role-assignments"], "Role removed")
export const useSetApprover = () =>
  useAct(
    (v: { staff_id: string; assessor_staff_id: string }) =>
      api("put", "/leave-approvers/{staff_id}", { path: { staff_id: v.staff_id }, body: { assessor_staff_id: v.assessor_staff_id } }),
    [], "Approver saved")
export const useApprover = (staff_id?: string) =>
  useQuery({
    queryKey: qk("leave-role-assignments", { approver: staff_id }),
    queryFn: () => api("get", "/leave-approvers/{staff_id}", { path: { staff_id: staff_id! } }),
    enabled: !!staff_id,
    retry: false,
  })

// ---- balances
export const useSaveBalances = () =>
  useAct((body: ApiBody<"/hr/staff-leaves", "put">) => api("put", "/hr/staff-leaves", { body }), ["leave-balances"], "Balances saved")

// ---- leave applications
export const useCreateLeaveOnBehalf = () =>
  useAct((body: ApiBody<"/leave-applications", "post">) => api("post", "/leave-applications", { body }), ["leave-applications", "leave-balances"], "Leave application created")
export const useUpdateLeaveStatus = () =>
  useAct(
    (v: { id: string; action: "approve" | "reject"; comment?: string }) =>
      api("put", "/leave-applications/{application_id}/update-status", { path: { application_id: v.id }, body: { action: v.action, comment: v.comment || null } }),
    ["leave-applications", "leave-balances"], "Status updated")
export const useHrDeleteLeave = () =>
  useAct((id: string) => api("delete", "/leave-applications/{application_id}/hr", { path: { application_id: id } }), ["leave-applications", "leave-balances"], "Application deleted")

// ---- flexi shifts
export const useSaveFlexiMaster = () =>
  useAct(
    ({ id, body }: { id?: string; body: ApiBody<"/hr/flexi-shift-masters", "post"> }) =>
      id ? api("put", "/hr/flexi-shift-masters/{row_id}", { path: { row_id: id }, body }) : api("post", "/hr/flexi-shift-masters", { body }),
    ["flexi-shift-masters"], "Flexi shift saved")
export const useDeleteFlexiMaster = () =>
  useAct((id: string) => api("delete", "/hr/flexi-shift-masters/{row_id}", { path: { row_id: id } }), ["flexi-shift-masters"], "Flexi shift deleted")
export const useCreateFlexiSchedule = () =>
  useAct((body: ApiBody<"/hr/flexi-shifts", "post">) => api("post", "/hr/flexi-shifts", { body }), ["flexi-shifts"], "Schedule created")
export const useDeleteFlexiSchedule = () =>
  useAct((id: string) => api("delete", "/hr/flexi-shifts/{schedule_id}", { path: { schedule_id: id } }), ["flexi-shifts"], "Schedule deleted")
export const useBulkAssignShift = () =>
  useAct((body: ApiBody<"/shifts/assignments/bulk", "post">) => api("post", "/shifts/assignments/bulk", { body }), ["shifts"], "Staff assigned")

// ---- reports (POST, run on demand)
type Range = ApiBody<"/hr/leave-report/generate", "post">
type Availed = ApiBody<"/hr/leave-report/availed-summary", "post">
export const RANGE_REPORTS = {
  generate: { label: "Leave report", run: (b: Range) => api("post", "/hr/leave-report/generate", { body: b }) },
  "short-leave": { label: "Short leave", run: (b: Range) => api("post", "/hr/leave-report/short-leave", { body: b }) },
  "deleted-leave": { label: "Deleted leave", run: (b: Range) => api("post", "/hr/leave-report/deleted-leave", { body: b }) },
  "co-od": { label: "Comp-off / on-duty", run: (b: Range) => api("post", "/hr/leave-report/co-od", { body: b }) },
} as const
export const AVAILED_REPORTS = {
  "availed-summary": { label: "Availed summary", run: (b: Availed) => api("post", "/hr/leave-report/availed-summary", { body: b }) },
  "availed-detailed": { label: "Availed detailed", run: (b: Availed) => api("post", "/hr/leave-report/availed-detailed", { body: b }) },
  "short-leave-deduction": { label: "Short-leave deduction", run: (b: Availed) => api("post", "/hr/leave-report/short-leave-deduction", { body: b }) },
  "co-od-availed-summary": { label: "Comp-off/OD availed summary", run: (b: Availed) => api("post", "/hr/leave-report/co-od-availed-summary", { body: b }) },
  "co-od-availed-detailed": { label: "Comp-off/OD availed detailed", run: (b: Availed) => api("post", "/hr/leave-report/co-od-availed-detailed", { body: b }) },
} as const
export const useRunReport = () => useMutation({ mutationFn: (fn: () => Promise<unknown>) => fn() as Promise<Row[]> })

// ---- promotion tools
type Promo = ApiBody<"/hr/promotion/leave-roles", "post">
export const PROMOTIONS = {
  "leave-roles": { label: "Leave roles", run: (b: Promo) => api("post", "/hr/promotion/leave-roles", { body: b }) },
  "role-assignments": { label: "Role assignments", run: (b: Promo) => api("post", "/hr/promotion/role-assignments", { body: b }) },
  "staff-leaves": { label: "Staff leave balances", run: (b: Promo) => api("post", "/hr/promotion/staff-leaves", { body: b }) },
} as const
export const useStaffGradePreview = (academic_year_id?: string) =>
  useQuery({
    queryKey: qk("staff-grades", { preview: academic_year_id }),
    queryFn: () => api("get", "/hr/promotion/staff-grade-preview", { query: { academic_year_id: academic_year_id! } }),
    enabled: !!academic_year_id,
  })
export const useRunPromotion = () =>
  useAct((fn: () => Promise<unknown>) => fn(), ["leave-roles", "leave-role-assignments", "leave-balances"], "Promotion complete")
