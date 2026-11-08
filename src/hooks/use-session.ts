"use client"

import { useMutation, useQuery, useQueryClient, type QueryFunctionContext } from "@tanstack/react-query"

import { SESSION_CONTEXT_KEY, SESSION_KEY } from "@/lib/query-keys"
import type { LoginInput, LoginResult, TwoFactorInput, User } from "@/types/auth"

async function fetchSession({ client }: QueryFunctionContext): Promise<User | null> {
  const response = await fetch("/api/auth/me")
  if (response.status === 401) return null
  if (!response.ok) throw new Error("Failed to load session")
  const data = (await response.json()) as { user: User }
  // Active branch / academic year scope the query cache; write them before the
  // user so the identity guard sees both. Best effort: unscoped on failure.
  try {
    const ctx = await fetch("/api/backend/auth/session")
    client.setQueryData(SESSION_CONTEXT_KEY, ctx.ok ? await ctx.json() : null)
  } catch {
    client.setQueryData(SESSION_CONTEXT_KEY, null)
  }
  return data.user
}

export function useSession() {
  return useQuery({
    queryKey: SESSION_KEY,
    queryFn: fetchSession,
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
      if ("user" in result) queryClient.setQueryData(SESSION_KEY, result.user)
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
    onSuccess: async () => {
      await queryClient.cancelQueries()
      queryClient.clear()
      queryClient.setQueryData(SESSION_KEY, null)
    },
  })
}
