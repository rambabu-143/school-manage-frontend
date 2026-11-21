"use client"

import { useQuery } from "@tanstack/react-query"

import { useAct } from "@/hooks/use-hr-admin"
import { api, type ApiBody } from "@/lib/typed-api"
import { qk } from "@/lib/query-keys"

export const useSectionAssignments = (academic_year_id?: string, grade_id?: string) =>
  useQuery({
    queryKey: qk("teacher-assignment", { sections: { academic_year_id, grade_id } }),
    queryFn: () => api("get", "/staff/teacher-assignment", { query: { academic_year_id, grade_id } }),
    enabled: !!academic_year_id,
  })
export const useSectionSubjectTeachers = (section_id?: string) =>
  useQuery({
    queryKey: qk("teacher-assignment", { subjects: section_id }),
    queryFn: () => api("get", "/staff/teacher-assignment/section/{section_id}/subject-teachers", { path: { section_id: section_id! } }),
    enabled: !!section_id,
  })
export const useSectionStaff = (section_id?: string) =>
  useQuery({
    queryKey: qk("teacher-assignment", { staff: section_id }),
    queryFn: () => api("get", "/staff/by-section/{section_id}", { path: { section_id: section_id! } }),
    enabled: !!section_id,
  })
export const useSchoolHeads = (head_type: string, academic_year_id?: string) =>
  useQuery({
    queryKey: qk("school-heads", { head_type, academic_year_id }),
    queryFn: () => api("get", "/staff/teacher-assignment/school-head/{head_type}", { path: { head_type }, query: { academic_year_id: academic_year_id! } }),
    enabled: !!academic_year_id && !!head_type,
  })
export const useHouseIncharge = (branch_id?: string) =>
  useQuery({ queryKey: qk("teacher-assignment", { houses: branch_id }), queryFn: () => api("get", "/staff/teacher-assignment/house-incharge", { query: { branch_id } }) })
export const useHouseTeachers = () =>
  useQuery({ queryKey: qk("house-teachers"), queryFn: () => api("get", "/house-teachers", { query: { limit: 500 } }) })
export const useStandardTeachers = () =>
  useQuery({ queryKey: qk("standard-teachers"), queryFn: () => api("get", "/standard-teachers", { query: { limit: 500 } }) })

const TA = ["teacher-assignment" as const]
export const useSetClassTeacher = () =>
  useAct((v: { staff_id: string; type: "ASSIGN" | "UNASSIGN"; section_id: string }) =>
    api("put", "/staff/teacher-assignment/class-teacher/{staff_id}", { path: { staff_id: v.staff_id }, body: { type: v.type, section_id: v.section_id } }), TA, "Class teacher updated")
export const useSetHelperTeacher = () =>
  useAct((v: { staff_id: string; type: "ASSIGN" | "UNASSIGN"; section_ids: string[] }) =>
    api("put", "/staff/teacher-assignment/helper-teacher/{staff_id}", { path: { staff_id: v.staff_id }, body: { type: v.type, section_ids: v.section_ids } }), TA, "Helper teacher updated")
export const useSetSubjectTeacher = () =>
  useAct((body: ApiBody<"/staff/teacher-assignment/subject-teacher", "post">) => api("post", "/staff/teacher-assignment/subject-teacher", { body }), TA, "Subject teachers updated")
export const useSetSchoolHead = () =>
  useAct((body: ApiBody<"/staff/teacher-assignment/school-head", "post">) => api("post", "/staff/teacher-assignment/school-head", { body }), ["school-heads"], "School head updated")
export const useSetHouseIncharge = () =>
  useAct((v: { house_id: string; type: "ASSIGN" | "UNASSIGN"; staff_ids: string[] }) =>
    api("put", "/staff/teacher-assignment/house-incharge/{house_id}", { path: { house_id: v.house_id }, body: { type: v.type, staff_ids: v.staff_ids } }), TA, "House in-charge updated")
export const useAddHouseTeacher = () =>
  useAct((body: ApiBody<"/house-teachers", "post">) => api("post", "/house-teachers", { body }), ["house-teachers"], "House teacher added")
export const useRemoveHouseTeacher = () =>
  useAct((id: string) => api("delete", "/house-teachers/{teacher_id}", { path: { teacher_id: id } }), ["house-teachers"], "House teacher removed")
export const useAddStandardTeacher = () =>
  useAct((body: ApiBody<"/standard-teachers", "post">) => api("post", "/standard-teachers", { body }), ["standard-teachers"], "Grade teacher added")
export const useRemoveStandardTeacher = () =>
  useAct((id: string) => api("delete", "/standard-teachers/{teacher_id}", { path: { teacher_id: id } }), ["standard-teachers"], "Grade teacher removed")
