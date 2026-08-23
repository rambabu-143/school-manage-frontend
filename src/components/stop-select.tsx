"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransportStops } from "@/hooks/use-transport-stops"

interface StopSelectProps {
  routeId: string | undefined
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function StopSelect({ routeId, value, onChange, disabled }: StopSelectProps) {
  const { data: stops, isPending } = useTransportStops(routeId)

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || !routeId || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={!routeId ? "Select a route first" : isPending ? "Loading stops..." : "Select a stop"}
        />
      </SelectTrigger>
      <SelectContent>
        {stops?.map((stop) => (
          <SelectItem key={stop.id} value={stop.id}>
            {stop.sequence}. {stop.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
