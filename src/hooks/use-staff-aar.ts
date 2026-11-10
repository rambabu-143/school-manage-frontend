"use client"

import { useQuery } from "@tanstack/react-query"

import { useAct } from "@/hooks/use-hr-admin"
import { api, type ApiBody } from "@/lib/typed-api"
import { qk } from "@/lib/query-keys"

export const useAarForm = (staff_id?: string, cycle_id?: string) =>
  useQuery({
    queryKey: qk("aar-forms", { staff_id, cycle_id }),
    queryFn: () => api("get", "/staff-aar/forms/{staff_id}", { path: { staff_id: staff_id! }, query: { cycle_id: cycle_id! } }),
    enabled: !!staff_id && !!cycle_id,
    retry: false,
  })
export const useAssessorForms = (cycle_id?: string) =>
  useQuery({
    queryKey: qk("aar-forms", { assessor: cycle_id }),
    queryFn: () => api("get", "/staff-aar/forms/assessor", { query: { cycle_id: cycle_id!, limit: 200 } }),
    enabled: !!cycle_id,
  })
export const useAarReport = (staff_id?: string, cycle_id?: string, enabled = false) =>
  useQuery({
    queryKey: qk("aar-forms", { report: staff_id, cycle_id }),
    queryFn: () => api("get", "/staff-aar/forms/{staff_id}/report", { path: { staff_id: staff_id! }, query: { cycle_id: cycle_id! } }),
    enabled: enabled && !!staff_id && !!cycle_id,
    retry: false,
  })
export const useValidateRatings = (staff_id?: string, cycle_id?: string) =>
  useQuery({
    queryKey: qk("aar-ratings", { staff_id, cycle_id }),
    queryFn: () => api("get", "/staff-aar/ratings/validate/{staff_id}", { path: { staff_id: staff_id! }, query: { cycle_id: cycle_id!, limit: 1000 } }),
    enabled: !!staff_id && !!cycle_id,
    retry: false,
  })
export const useValidateStaffRatings = (rating_for: "VP" | "HOD" | "HM", cycle_id?: string, enabled = false) =>
  useQuery({
    queryKey: qk("aar-ratings", { rating_for, cycle_id }),
    queryFn: () => api("get", "/staff-aar/ratings/validate-staff/{rating_for}", { path: { rating_for }, query: { cycle_id: cycle_id!, limit: 1000 } }),
    enabled: enabled && !!cycle_id,
    retry: false,
  })
export const useSaveAarForm = () =>
  useAct(
    (v: { form_id?: string; body: ApiBody<"/staff-aar/forms", "post"> }) =>
      v.form_id
        ? api("put", "/staff-aar/forms/{form_id}", { path: { form_id: v.form_id }, body: { self_assessment: v.body.self_assessment, assessment: v.body.assessment, is_submit: v.body.is_submit } })
        : api("post", "/staff-aar/forms", { body: v.body }),
    ["aar-forms"], "Form saved")
