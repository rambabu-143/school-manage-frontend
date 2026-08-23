"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAcademicYears } from "@/hooks/use-academic-years"

interface AcademicYearSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function AcademicYearSelect({ value, onChange, disabled }: AcademicYearSelectProps) {
  const { data: years, isPending } = useAcademicYears()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading years..." : "Select an academic year"} />
      </SelectTrigger>
      <SelectContent>
        {years?.map((year) => (
          <SelectItem key={year.id} value={year.id}>
            {year.name}
            {year.is_current ? " (current)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
