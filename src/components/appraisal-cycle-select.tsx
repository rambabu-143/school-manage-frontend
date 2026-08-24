"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppraisalCycles } from "@/hooks/use-appraisal-cycles"

interface AppraisalCycleSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function AppraisalCycleSelect({ value, onChange, disabled }: AppraisalCycleSelectProps) {
  const { data: cycles, isPending } = useAppraisalCycles()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading cycles..." : "Select a cycle"} />
      </SelectTrigger>
      <SelectContent>
        {cycles?.map((cycle) => (
          <SelectItem key={cycle.id} value={cycle.id}>
            {cycle.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
