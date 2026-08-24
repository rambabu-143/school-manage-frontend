"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Stream, StreamCreateInput } from "@/types/streams"

export function useStreams(branchId?: string) {
  return useQuery({
    queryKey: ["streams", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<Stream[]>("/streams", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateStream() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: StreamCreateInput) => {
      const { data } = await apiClient.post<Stream>("/streams", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] })
      toast.success("Stream created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
