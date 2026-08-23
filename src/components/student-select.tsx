"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStudents } from "@/hooks/use-students"

interface StudentSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  excludeIds?: readonly string[]
  disabled?: boolean
}

export function StudentSelect({ value, onChange, excludeIds, disabled }: StudentSelectProps) {
  const { data: students, isPending } = useStudents()
  const options = students?.filter((student) => !excludeIds?.includes(student.id))

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading students..." : "Select a student"} />
      </SelectTrigger>
      <SelectContent>
        {options?.map((student) => (
          <SelectItem key={student.id} value={student.id}>
            {student.first_name} {student.last_name} ({student.admission_number})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
