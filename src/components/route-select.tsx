"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransportRoutes } from "@/hooks/use-transport-routes"

interface RouteSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function RouteSelect({ value, onChange, disabled }: RouteSelectProps) {
  const { data: routes, isPending } = useTransportRoutes()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading routes..." : "Select a route"} />
      </SelectTrigger>
      <SelectContent>
        {routes?.map((route) => (
          <SelectItem key={route.id} value={route.id}>
            {route.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
