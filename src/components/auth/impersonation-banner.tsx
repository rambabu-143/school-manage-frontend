"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { useBackToFamily, useExitImpersonation, useSessionScope } from "@/hooks/use-identity"
import { formatRole } from "@/lib/format-role"
import type { User } from "@/types/auth"

export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

export function ImpersonationBanner({ user }: { user: User }) {
  const { data: scope } = useSessionScope()
  const exit = useExitImpersonation()
  const back = useBackToFamily()
  const family = !scope?.impersonation && Boolean(scope?.family_switch)
  const expiresAt = (scope?.impersonation ?? scope?.family_switch)?.expires_at
  const [now, setNow] = React.useState(() => Date.now())
  const { mutate } = exit

  React.useEffect(() => {
    if (!expiresAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const remaining = expiresAt ? expiresAt - now : 0
  React.useEffect(() => {
    // A family token has no refresh token: on expiry authedBackendFetch quietly refreshes with the guardian's own refresh token, so no exit call is needed.
    if (expiresAt && remaining <= 0 && !family) mutate()
  }, [expiresAt, remaining, mutate, family])

  if (!expiresAt) return null
  if (family) {
    return (
      <div role="status" className="flex flex-wrap items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-black">
        <span>Viewing as {user.email} ({formatRole(user.role)}). Ends in {formatCountdown(remaining)}.</span>
        <Button size="sm" variant="secondary" disabled={back.isPending} onClick={() => back.mutate()}>Back to family</Button>
      </div>
    )
  }
  return (
    <div role="status" className="flex flex-wrap items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-black">
      <span>Viewing as {user.email} ({formatRole(user.role)}) (impersonating). Ends in {formatCountdown(remaining)}.</span>
      <Button size="sm" variant="secondary" disabled={exit.isPending} onClick={() => exit.mutate()}>Exit</Button>
    </div>
  )
}
