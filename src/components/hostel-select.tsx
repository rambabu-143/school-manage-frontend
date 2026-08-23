"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHostels } from "@/hooks/use-hostels"

interface HostelSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function HostelSelect({ value, onChange, disabled }: HostelSelectProps) {
  const { data: hostels, isPending } = useHostels()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading hostels..." : "Select a hostel"} />
      </SelectTrigger>
      <SelectContent>
        {hostels?.map((hostel) => (
          <SelectItem key={hostel.id} value={hostel.id}>
            {hostel.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
