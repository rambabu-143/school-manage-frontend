"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBranches } from "@/hooks/use-branches"

interface BranchSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function BranchSelect({ value, onChange, disabled }: BranchSelectProps) {
  const { data: branches, isPending } = useBranches()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading branches..." : "Select a branch"} />
      </SelectTrigger>
      <SelectContent>
        {branches?.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
