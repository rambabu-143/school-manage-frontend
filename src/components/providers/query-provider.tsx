"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { attachIdentityGuard } from "@/lib/identity-lifecycle"
import { getScopeKey, subscribeQueryScope } from "@/lib/query-keys"
import { subscribeIdentityChange } from "@/lib/session-events"
import { makeQueryClient } from "@/lib/query-policy"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

function makeClient() {
  const client = makeQueryClient()
  attachIdentityGuard(client, subscribeIdentityChange)
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
  // qk() reads module state, so mounted observers would keep stale keys after a
  // scope change (login, branch / year switch). Re-mounting the tree under the
  // scope key makes every hook re-key against the new identity.
  const scope = React.useSyncExternalStore(subscribeQueryScope, getScopeKey, () => "anon")

  return (
    <QueryClientProvider client={queryClient}>
      <React.Fragment key={scope}>{children}</React.Fragment>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
