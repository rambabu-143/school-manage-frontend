"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGrades } from "@/hooks/use-grades"

interface GradeSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  branchId?: string
  disabled?: boolean
}

export function GradeSelect({ value, onChange, branchId, disabled }: GradeSelectProps) {
  const { data: grades, isPending } = useGrades(branchId)

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading grades..." : "Select a grade"} />
      </SelectTrigger>
      <SelectContent>
        {grades?.map((grade) => (
          <SelectItem key={grade.id} value={grade.id}>
            {grade.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
