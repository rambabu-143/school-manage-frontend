"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { invalidateWithDependents } from "@/lib/invalidation"
import { qk } from "@/lib/query-keys"
import { api } from "@/lib/typed-api"
import { errorMessage } from "@/lib/error-message"
import type {
  GuardianCreateInput,
  Student,
  StudentCreateInput,
  StudentUpdateInput,
} from "@/types/people"

export function useStudents(params?: {
  branchId?: string
  gradeId?: string
  sectionId?: string
  isActive?: boolean
  search?: string
}) {
  return useQuery({
    queryKey: qk("students", params),
    queryFn: async () => {
      // Query params are checked against the contract. The cast keeps the legacy
      // Student type (guardians required) until it is replaced by the schema type.
      const students = await api("get", "/students", {
        query: {
          branch_id: params?.branchId || undefined,
          grade_id: params?.gradeId || undefined,
          section_id: params?.sectionId || undefined,
          is_active: params?.isActive,
          search: params?.search || undefined,
        },
      })
      return students as Student[]
    },
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: StudentCreateInput) => {
      const { data } = await apiClient.post<Student>("/students", input)
      return data
    },
    onSuccess: () => {
      invalidateWithDependents(queryClient, "students")
      toast.success("Student created")
    },
    onError: (error) => {
      toast.error(errorMessage(error))
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: StudentUpdateInput }) => {
      return (await api("put", "/students/{student_id}", {
        path: { student_id: id },
        body: input,
      })) as Student
    },
    onSuccess: () => {
      invalidateWithDependents(queryClient, "students")
      toast.success("Student updated")
    },
    onError: (error) => {
      toast.error(errorMessage(error))
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/students/${id}`)
    },
    onSuccess: () => {
      invalidateWithDependents(queryClient, "students")
      toast.success("Student deleted")
    },
    onError: (error) => {
      toast.error(errorMessage(error))
    },
  })
}

export function useAddGuardian() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      studentId,
      input,
    }: {
      studentId: string
      input: GuardianCreateInput
    }) => {
      const { data } = await apiClient.post(`/students/${studentId}/guardians`, input)
      return data
    },
    onSuccess: () => {
      invalidateWithDependents(queryClient, "students")
      toast.success("Guardian added")
    },
    onError: (error) => {
      toast.error(errorMessage(error))
    },
  })
}
