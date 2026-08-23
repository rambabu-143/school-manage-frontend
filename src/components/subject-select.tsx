"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSubjects } from "@/hooks/use-subjects"

interface SubjectSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function SubjectSelect({ value, onChange, disabled }: SubjectSelectProps) {
  const { data: subjects, isPending } = useSubjects()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading subjects..." : "Select a subject"} />
      </SelectTrigger>
      <SelectContent>
        {subjects?.map((subject) => (
          <SelectItem key={subject.id} value={subject.id}>
            {subject.name} ({subject.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
