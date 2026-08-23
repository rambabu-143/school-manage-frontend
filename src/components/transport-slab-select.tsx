"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransportSlabs } from "@/hooks/use-transport-slabs"

interface TransportSlabSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function TransportSlabSelect({ value, onChange, disabled }: TransportSlabSelectProps) {
  const { data: slabs, isPending } = useTransportSlabs()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading fare slabs..." : "Select a fare slab"} />
      </SelectTrigger>
      <SelectContent>
        {slabs?.map((slab) => (
          <SelectItem key={slab.id} value={slab.id}>
            {slab.name} ({slab.monthly_fare}/mo)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
