"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStaff } from "@/hooks/use-staff"

interface StaffSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function StaffSelect({ value, onChange, disabled }: StaffSelectProps) {
  const { data: staff, isPending } = useStaff()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading staff..." : "Select a staff member"} />
      </SelectTrigger>
      <SelectContent>
        {staff?.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.first_name} {member.last_name} ({member.employee_number})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
