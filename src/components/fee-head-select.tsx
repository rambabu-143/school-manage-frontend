"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFeeHeads } from "@/hooks/use-fee-heads"

interface FeeHeadSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function FeeHeadSelect({ value, onChange, disabled }: FeeHeadSelectProps) {
  const { data: feeHeads, isPending } = useFeeHeads()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading fee heads..." : "None"} />
      </SelectTrigger>
      <SelectContent>
        {feeHeads?.map((head) => (
          <SelectItem key={head.id} value={head.id}>
            {head.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
