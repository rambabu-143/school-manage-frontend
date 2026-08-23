"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { AdmissionApplication, ApplicationCreateInput } from "@/types/admissions"
import type { Student } from "@/types/people"

export function useApplications(params?: { branchId?: string; status?: string }) {
  return useQuery({
    queryKey: ["applications", params],
    queryFn: async () => {
      const { data } = await apiClient.get<AdmissionApplication[]>("/admission-applications", {
        params: { branch_id: params?.branchId, status: params?.status },
      })
      return data
    },
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ApplicationCreateInput) => {
      const { data } = await apiClient.post<AdmissionApplication>(
        "/admission-applications",
        input
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      toast.success("Application created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: "under_review" | "approved"
    }) => {
      const { data } = await apiClient.post<AdmissionApplication>(
        `/admission-applications/${id}/status`,
        { status }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      toast.success("Application status updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useRejectApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.post<AdmissionApplication>(
        `/admission-applications/${id}/reject`,
        { rejection_reason: reason }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      toast.success("Application rejected")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useEnrollApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, admissionNumber }: { id: string; admissionNumber: string }) => {
      const { data } = await apiClient.post<Student>(
        `/admission-applications/${id}/enroll`,
        { admission_number: admissionNumber }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      queryClient.invalidateQueries({ queryKey: ["students"] })
      toast.success("Student enrolled")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
