"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAcademicYears } from "@/hooks/use-academic-years"
import { useGrades } from "@/hooks/use-grades"
import { useSections } from "@/hooks/use-sections"

interface SectionSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function SectionSelect({ value, onChange, disabled }: SectionSelectProps) {
  const { data: sections, isPending } = useSections()
  const { data: grades } = useGrades()
  const { data: years } = useAcademicYears()

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isPending ? "Loading sections..." : "Select a section"} />
      </SelectTrigger>
      <SelectContent>
        {sections?.map((section) => {
          const grade = grades?.find((g) => g.id === section.grade_id)
          const year = years?.find((y) => y.id === section.academic_year_id)
          return (
            <SelectItem key={section.id} value={section.id}>
              {grade?.name ?? "?"} - {section.name} ({year?.name ?? "?"})
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
