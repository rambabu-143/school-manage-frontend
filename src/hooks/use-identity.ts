"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { onIdentityChange } from "@/lib/session-events"

export interface SessionScope {
  branch_id: string | null
  academic_year_id: string | null
  impersonation: { expires_at: number } | null
}

async function post(url: string, body?: unknown, method = "POST") {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error ?? "Something went wrong. Please try again.")
  return data
}

/** Tell the cache owner identity changed; if nobody is listening, clear it here. */
function useIdentityChanged() {
  const queryClient = useQueryClient()
  return () => {
    if (!onIdentityChange()) queryClient.clear()
    // Always refetch who/where we are, then let the server tree re-render.
    queryClient.invalidateQueries({ queryKey: ["session"] })
    queryClient.invalidateQueries({ queryKey: ["session-scope"] })
    window.location.reload()
  }
}

export function useSessionScope() {
  return useQuery({
    queryKey: ["session-scope"],
    queryFn: async (): Promise<SessionScope> => {
      const response = await fetch("/api/auth/session")
      if (!response.ok) throw new Error("Failed to load session")
      return response.json()
    },
    staleTime: 60 * 1000,
    retry: false,
  })
}

export function useSwitchBranch() {
  const changed = useIdentityChanged()
  return useMutation({
    mutationFn: (branch_id: string) => post("/api/auth/switch-branch", { branch_id }),
    onSuccess: changed,
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useSwitchYear() {
  const changed = useIdentityChanged()
  return useMutation({
    mutationFn: (academic_year_id: string) => post("/api/auth/switch-year", { academic_year_id }),
    onSuccess: changed,
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useImpersonate() {
  const changed = useIdentityChanged()
  return useMutation({
    mutationFn: (user_id: string) => post("/api/auth/impersonate", { user_id }),
    onSuccess: changed,
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useExitImpersonation() {
  const changed = useIdentityChanged()
  return useMutation({
    mutationFn: () => post("/api/auth/impersonate", undefined, "DELETE"),
    onSuccess: changed,
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useLogoutAll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => post("/api/auth/logout-all"),
    onSuccess: () => {
      queryClient.clear()
      window.location.assign("/login")
    },
  })
}

export function useTwoFactor() {
  return {
    setup: useMutation({
      mutationFn: (): Promise<{ secret: string; provisioning_uri: string }> => post("/api/auth/2fa/setup"),
    }),
    enable: useMutation({
      mutationFn: (code: string): Promise<{ backup_codes: string[] }> => post("/api/auth/2fa/enable", { code }),
    }),
    disable: useMutation({ mutationFn: (password: string) => post("/api/auth/2fa/disable", { password }) }),
  }
}
