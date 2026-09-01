"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { User, UserCreateInput } from "@/types/auth"

export function useTenantUsers() {
  return useQuery({
    queryKey: ["tenant-users"],
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>("/auth/users")
      return data
    },
  })
}

export function useCreateTenantUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UserCreateInput) => {
      const { data } = await apiClient.post<User>("/auth/users", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-users"] })
      toast.success("User created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
