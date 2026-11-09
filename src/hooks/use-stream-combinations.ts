"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import { errorMessage } from "@/lib/error-message"
import type { StreamCombination, StreamCombinationCreateInput } from "@/types/streams"

export function useStreamCombinations(streamId?: string) {
  return useQuery({
    queryKey: qk("stream-combinations", { streamId }),
    queryFn: async () => {
      const { data } = await apiClient.get<StreamCombination[]>("/stream-combinations", {
        params: streamId ? { stream_id: streamId } : undefined,
      })
      return data
    },
  })
}

export function useCreateStreamCombination() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: StreamCombinationCreateInput) => {
      const { data } = await apiClient.post<StreamCombination>("/stream-combinations", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk("stream-combinations") })
      toast.success("Combination created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
