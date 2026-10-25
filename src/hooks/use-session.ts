"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { LoginInput, LoginResult, TwoFactorInput, User } from "@/types/auth"

async function fetchSession(): Promise<User | null> {
  const response = await fetch("/api/auth/me")
  if (response.status === 401) return null
  if (!response.ok) throw new Error("Failed to load session")
  const data = (await response.json()) as { user: User }
  return data.user
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: LoginInput | TwoFactorInput): Promise<LoginResult> => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Login failed")
      }
      return data as LoginResult
    },
    onSuccess: (result) => {
      if ("user" in result) queryClient.setQueryData(["session"], result.user)
    },
  })
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) throw new Error("Something went wrong. Please try again.")
    },
  })
}

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Could not reset your password")
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" })
    },
    onSuccess: () => {
      queryClient.setQueryData(["session"], null)
      queryClient.clear()
    },
  })
}
