"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDepartments } from "@/hooks/use-departments"

interface DepartmentSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function DepartmentSelect({ value, onChange, disabled }: DepartmentSelectProps) {
  const { data: departments, isPending } = useDepartments()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading departments..." : "Optional - select a department"} />
      </SelectTrigger>
      <SelectContent>
        {departments?.map((department) => (
          <SelectItem key={department.id} value={department.id}>
            {department.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
