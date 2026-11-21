"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { api } from "@/lib/typed-api"
import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import { errorMessage } from "@/lib/error-message"
import type { Alumni, AlumniCreateInput, AlumniUpdateInput } from "@/types/alumni"

export function useAlumni(graduationYear?: number) {
  return useQuery({
    queryKey: qk("alumni", { graduationYear }),
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
      queryClient.invalidateQueries({ queryKey: qk("alumni") })
      queryClient.invalidateQueries({ queryKey: qk("students") })
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
      queryClient.invalidateQueries({ queryKey: qk("alumni") })
      toast.success("Alumni record updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteAlumni() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api("delete", "/alumni/{alumni_id}", { path: { alumni_id: id } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk("alumni") })
      toast.success("Alumni record deleted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
