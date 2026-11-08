"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { attachIdentityGuard } from "@/lib/identity-lifecycle"
import { makeQueryClient } from "@/lib/query-policy"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

function makeClient() {
  const client = makeQueryClient()
  attachIdentityGuard(client)
  return client
}

// One client per browser tab (module-level singleton), a fresh one per
// request on the server - avoids leaking query state across users during SSR.
let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === "undefined") return makeClient()
  if (!browserQueryClient) browserQueryClient = makeClient()
  return browserQueryClient
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
