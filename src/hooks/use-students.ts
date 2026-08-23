"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  GuardianCreateInput,
  Student,
  StudentCreateInput,
  StudentUpdateInput,
} from "@/types/people"

export function useStudents(branchId?: string) {
  return useQuery({
    queryKey: ["students", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<Student[]>("/students", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
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
      queryClient.invalidateQueries({ queryKey: ["students"] })
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
      const { data } = await apiClient.put<Student>(`/students/${id}`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
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
      queryClient.invalidateQueries({ queryKey: ["students"] })
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
      queryClient.invalidateQueries({ queryKey: ["students"] })
      toast.success("Guardian added")
    },
    onError: (error) => {
      toast.error(errorMessage(error))
    },
  })
}
