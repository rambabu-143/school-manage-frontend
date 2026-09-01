"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useClubs } from "@/hooks/use-clubs"

interface ClubSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function ClubSelect({ value, onChange, disabled }: ClubSelectProps) {
  const { data: clubs, isPending } = useClubs()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading clubs..." : "Select a club"} />
      </SelectTrigger>
      <SelectContent>
        {clubs?.map((club) => (
          <SelectItem key={club.id} value={club.id}>
            {club.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
