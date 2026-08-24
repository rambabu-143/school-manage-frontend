"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Alumni, AlumniCreateInput, AlumniUpdateInput } from "@/types/alumni"

export function useAlumni(graduationYear?: number) {
  return useQuery({
    queryKey: ["alumni", { graduationYear }],
    queryFn: async () => {
      const { data } = await apiClient.get<Alumni[]>("/alumni", {
        params: graduationYear ? { graduation_year: graduationYear } : undefined,
      })
      return data
    },
  })
}

export function useCreateAlumni() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AlumniCreateInput) => {
      const { data } = await apiClient.post<Alumni>("/alumni", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni"] })
      queryClient.invalidateQueries({ queryKey: ["students"] })
      toast.success("Alumni record created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdateAlumni() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: AlumniUpdateInput }) => {
      const { data } = await apiClient.put<Alumni>(`/alumni/${id}`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni"] })
      toast.success("Alumni record updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
