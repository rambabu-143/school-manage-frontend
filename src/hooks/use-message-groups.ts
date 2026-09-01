"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { MessageGroup, MessageGroupCreateInput } from "@/types/communications"

export function useMessageGroups() {
  return useQuery({
    queryKey: ["message-groups"],
    queryFn: async () => {
      const { data } = await apiClient.get<MessageGroup[]>("/message-groups")
      return data
    },
  })
}

export function useCreateMessageGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: MessageGroupCreateInput) => {
      const { data } = await apiClient.post<MessageGroup>("/message-groups", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-groups"] })
      toast.success("Group created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteMessageGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/message-groups/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-groups"] })
      toast.success("Group deleted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
