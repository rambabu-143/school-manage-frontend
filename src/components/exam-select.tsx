"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useExams } from "@/hooks/use-exams"

interface ExamSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function ExamSelect({ value, onChange, disabled }: ExamSelectProps) {
  const { data: exams, isPending } = useExams()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading exams..." : "Select an exam"} />
      </SelectTrigger>
      <SelectContent>
        {exams?.map((exam) => (
          <SelectItem key={exam.id} value={exam.id}>
            {exam.name}
            {exam.is_locked ? " (locked)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
