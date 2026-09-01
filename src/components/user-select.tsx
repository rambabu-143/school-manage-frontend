"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTenantUsers } from "@/hooks/use-tenant-users"
import type { Role } from "@/types/auth"

interface UserSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  roles?: readonly Role[]
  disabled?: boolean
}

/** Links a Staff/Guardian record to an existing tenant login (`user_id`). Optional everywhere it's used. */
export function UserSelect({ value, onChange, roles, disabled }: UserSelectProps) {
  const { data: users, isPending } = useTenantUsers()
  const options = roles ? users?.filter((user) => roles.includes(user.role as Role)) : users

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading users..." : "Optional - link a login"} />
      </SelectTrigger>
      <SelectContent>
        {options?.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
