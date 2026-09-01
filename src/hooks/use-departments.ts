"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Department, DepartmentCreateInput } from "@/types/departments"

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await apiClient.get<Department[]>("/departments")
      return data
    },
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: DepartmentCreateInput) => {
      const { data } = await apiClient.post<Department>("/departments", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })
      toast.success("Department created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
