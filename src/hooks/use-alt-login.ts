"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { LoginResult } from "@/types/auth"

async function post<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error ?? "Something went wrong. Please try again.")
  return data as T
}

export function useRequestOtp() {
  return useMutation({ mutationFn: (mobile: string) => post("/api/auth/otp/request", { mobile }) })
}

export function useVerifyOtp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { mobile: string; otp: string }) => post<LoginResult>("/api/auth/otp/verify", v),
    onSuccess: (r) => { if ("user" in r) queryClient.setQueryData(["session"], r.user) },
  })
}

export function useGoogleLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id_token: string) => post<LoginResult>("/api/auth/google", { id_token }),
    onSuccess: (r) => { if ("user" in r) queryClient.setQueryData(["session"], r.user) },
  })
}
