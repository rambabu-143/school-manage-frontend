"use client"

import type { ReactNode } from "react"

import { useSession } from "@/hooks/use-session"
import type { Role } from "@/types/auth"

/** Renders children only for roles the backend allows; otherwise a short notice. */
export function RoleGate({ roles, what, children }: { roles: readonly Role[]; what: string; children: ReactNode }) {
  const { data: user } = useSession()
  if (!user || !roles.includes(user.role)) return <p className="text-sm text-muted-foreground">Your role cannot view {what}.</p>
  return <>{children}</>
}
