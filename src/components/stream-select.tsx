"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStreams } from "@/hooks/use-streams"

interface StreamSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function StreamSelect({ value, onChange, disabled }: StreamSelectProps) {
  const { data: streams, isPending } = useStreams()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading streams..." : "Select a stream"} />
      </SelectTrigger>
      <SelectContent>
        {streams?.map((stream) => (
          <SelectItem key={stream.id} value={stream.id}>
            {stream.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
