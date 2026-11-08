"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useImpersonate } from "@/hooks/use-identity"
import { useTenantUsers } from "@/hooks/use-tenant-users"
import { formatRole } from "@/lib/format-role"
import { canImpersonateTarget } from "@/lib/role-guard"
import type { Role } from "@/types/auth"

export function SwitchUserDialog({ open, onOpenChange, role }: { open: boolean; onOpenChange: (o: boolean) => void; role: Role }) {
  const { data: users, isPending, isError } = useTenantUsers()
  const impersonate = useImpersonate()
  const [q, setQ] = React.useState("")
  const list = (users ?? [])
    .filter((u) => u.is_active && canImpersonateTarget(role, u.role) && u.email.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 50)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>View as someone else</DialogTitle>
          <DialogDescription>See the app the way they do for 15 minutes. You can exit at any time.</DialogDescription>
        </DialogHeader>
        <Input aria-label="Search people" placeholder="Search by email" value={q} onChange={(e) => setQ(e.target.value)} />
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {isPending && <li className="p-2 text-sm text-muted-foreground">Loading people...</li>}
          {isError && <li role="alert" className="p-2 text-sm text-destructive">Couldn&apos;t load people. Please try again.</li>}
          {!isPending && !isError && list.length === 0 && <li className="p-2 text-sm text-muted-foreground">No one found.</li>}
          {list.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-muted">
              <span className="min-w-0"><span className="block truncate text-sm">{u.email}</span>
                <span className="text-xs text-muted-foreground">{formatRole(u.role)}</span></span>
              <Button size="sm" disabled={impersonate.isPending} onClick={() => impersonate.mutate(u.id)}>View as</Button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
