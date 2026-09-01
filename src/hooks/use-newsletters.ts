"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Newsletter, NewsletterCreateInput } from "@/types/newsletters"

export function useNewsletters() {
  return useQuery({
    queryKey: ["newsletters"],
    queryFn: async () => {
      const { data } = await apiClient.get<Newsletter[]>("/newsletters")
      return data
    },
  })
}

export function useCreateNewsletter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: NewsletterCreateInput) => {
      const { data } = await apiClient.post<Newsletter>("/newsletters", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] })
      toast.success("Newsletter saved as draft")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function usePublishNewsletter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<Newsletter>(`/newsletters/${id}/publish`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] })
      toast.success("Newsletter published")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
