"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  IdCardData,
  IdCardUpdateRequest,
  IdCardUpdateRequestCreateInput,
  StudentPhotoUploadResult,
} from "@/types/idcards"

export function useStudentIdCard(studentId: string | undefined) {
  return useQuery({
    queryKey: ["id-card", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<IdCardData>(`/students/${studentId}/id-card`)
      return data
    },
    enabled: !!studentId,
  })
}

export function useMyChildIdCard(studentId: string | undefined) {
  return useQuery({
    queryKey: ["portal", "id-card", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<IdCardData>(`/me/children/${studentId}/id-card`)
      return data
    },
    enabled: !!studentId,
  })
}

export function useRequestIdCardUpdate(studentId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: IdCardUpdateRequestCreateInput) => {
      const { data } = await apiClient.post<IdCardUpdateRequest>(
        `/me/children/${studentId}/id-card/update-requests`,
        input
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["id-card-requests"] })
      toast.success("Request submitted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useIdCardUpdateRequests(status?: "pending" | "resolved") {
  return useQuery({
    queryKey: ["id-card-requests", { status }],
    queryFn: async () => {
      const { data } = await apiClient.get<IdCardUpdateRequest[]>("/id-card-requests", {
        params: status ? { status } : undefined,
      })
      return data
    },
  })
}

export function useUploadStudentPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ studentId, file }: { studentId: string; file: File }) => {
      const formData = new FormData()
      formData.append("file", file)
      const { data } = await apiClient.post<StudentPhotoUploadResult>(
        `/students/${studentId}/photo`,
        formData
      )
      return data
    },
    onSuccess: (result) => {
      if (result.passed) {
        queryClient.invalidateQueries({ queryKey: ["students"] })
        queryClient.invalidateQueries({ queryKey: ["id-card"] })
        toast.success("Photo accepted")
      } else {
        toast.error(result.reason)
      }
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useResolveIdCardUpdateRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data } = await apiClient.put<IdCardUpdateRequest>(
        `/id-card-requests/${requestId}/resolve`
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["id-card-requests"] })
      toast.success("Marked resolved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
