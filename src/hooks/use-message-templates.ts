"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { MessageTemplate, MessageTemplateCreateInput } from "@/types/communications"

export function useMessageTemplates() {
  return useQuery({
    queryKey: ["message-templates"],
    queryFn: async () => {
      const { data } = await apiClient.get<MessageTemplate[]>("/message-templates")
      return data
    },
  })
}

export function useCreateMessageTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: MessageTemplateCreateInput) => {
      const { data } = await apiClient.post<MessageTemplate>("/message-templates", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] })
      toast.success("Template created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteMessageTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/message-templates/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] })
      toast.success("Template deleted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
