"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { useExitImpersonation, useSessionScope } from "@/hooks/use-identity"
import { formatRole } from "@/lib/format-role"
import type { User } from "@/types/auth"

export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

export function ImpersonationBanner({ user }: { user: User }) {
  const { data: scope } = useSessionScope()
  const exit = useExitImpersonation()
  const expiresAt = scope?.impersonation?.expires_at
  const [now, setNow] = React.useState(() => Date.now())
  const { mutate } = exit

  React.useEffect(() => {
    if (!expiresAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const remaining = expiresAt ? expiresAt - now : 0
  React.useEffect(() => {
    if (expiresAt && remaining <= 0) mutate()
  }, [expiresAt, remaining, mutate])

  if (!expiresAt) return null
  return (
    <div role="status" className="flex flex-wrap items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-black">
      <span>Viewing as {user.email} ({formatRole(user.role)}) (impersonating). Ends in {formatCountdown(remaining)}.</span>
      <Button size="sm" variant="secondary" disabled={exit.isPending} onClick={() => exit.mutate()}>Exit</Button>
    </div>
  )
}
