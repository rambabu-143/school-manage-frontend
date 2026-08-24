"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHouses } from "@/hooks/use-houses"

interface HouseSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function HouseSelect({ value, onChange, disabled }: HouseSelectProps) {
  const { data: houses, isPending } = useHouses()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading houses..." : "Select a house"} />
      </SelectTrigger>
      <SelectContent>
        {houses?.map((house) => (
          <SelectItem key={house.id} value={house.id}>
            {house.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
