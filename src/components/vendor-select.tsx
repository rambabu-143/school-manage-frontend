"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVendors } from "@/hooks/use-vendors"

interface VendorSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function VendorSelect({ value, onChange, disabled }: VendorSelectProps) {
  const { data: vendors, isPending } = useVendors()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading vendors..." : "Select a vendor"} />
      </SelectTrigger>
      <SelectContent>
        {vendors?.map((vendor) => (
          <SelectItem key={vendor.id} value={vendor.id}>
            {vendor.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
