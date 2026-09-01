"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  EmailConfig,
  EmailConfigUpdateInput,
  EmailMessage,
  EmailMessageCreateInput,
  SmsConfig,
  SmsConfigUpdateInput,
  SmsMessage,
  SmsMessageCreateInput,
} from "@/types/communications"

export function useEmailConfig() {
  return useQuery({
    queryKey: ["email-config"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<EmailConfig>("/email-config")
        return data
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status === 404
        ) {
          return null
        }
        throw error
      }
    },
  })
}

export function useSetEmailConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: EmailConfigUpdateInput) => {
      const { data } = await apiClient.put<EmailConfig>("/email-config", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-config"] })
      toast.success("Email settings saved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useEmailMessages() {
  return useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const { data } = await apiClient.get<EmailMessage[]>("/emails")
      return data
    },
  })
}

export function useSendEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: EmailMessageCreateInput) => {
      const { data } = await apiClient.post<EmailMessage>("/emails", input)
      return data
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["emails"] })
      if (message.status === "sent") toast.success("Email sent")
      else if (message.status === "partial") toast.warning("Email sent to some recipients")
      else toast.error("Email failed to send")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useSmsConfig() {
  return useQuery({
    queryKey: ["sms-config"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<SmsConfig>("/sms-config")
        return data
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status === 404
        ) {
          return null
        }
        throw error
      }
    },
  })
}

export function useSetSmsConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SmsConfigUpdateInput) => {
      const { data } = await apiClient.put<SmsConfig>("/sms-config", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-config"] })
      toast.success("SMS settings saved")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useSmsMessages() {
  return useQuery({
    queryKey: ["sms-messages"],
    queryFn: async () => {
      const { data } = await apiClient.get<SmsMessage[]>("/sms")
      return data
    },
  })
}

export function useSendSms() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SmsMessageCreateInput) => {
      const { data } = await apiClient.post<SmsMessage>("/sms", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-messages"] })
      toast.success("SMS sent")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
