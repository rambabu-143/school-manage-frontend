"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStreamCombinations } from "@/hooks/use-stream-combinations"

interface StreamCombinationSelectProps {
  streamId: string | undefined
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function StreamCombinationSelect({
  streamId,
  value,
  onChange,
  disabled,
}: StreamCombinationSelectProps) {
  const { data: combinations, isPending } = useStreamCombinations(streamId)

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || !streamId || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={
            !streamId ? "Select a stream first" : isPending ? "Loading combinations..." : "Select a combination"
          }
        />
      </SelectTrigger>
      <SelectContent>
        {combinations?.map((combination) => (
          <SelectItem key={combination.id} value={combination.id}>
            {combination.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
