"use client"

import { useId } from "react"

import { Label } from "@/components/ui/label"
import { useAcademicYears } from "@/hooks/use-academic-years"
import { useBranches } from "@/hooks/use-branches"
import { useGrades } from "@/hooks/use-grades"
import { useSections } from "@/hooks/use-sections"
import { useStaff } from "@/hooks/use-staff"
import { useSubjects } from "@/hooks/use-subjects"

interface PickProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[] | undefined
  loading?: boolean
}

/** Native select: keyboard and screen-reader friendly, no extra state. */
export function Pick({ label, value, onChange, options, loading }: PickProps) {
  const id = useId()
  return (
    <div className="flex min-w-48 flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
      >
        <option value="">{loading ? "Loading..." : "Select..."}</option>
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function useGradeOptions() {
  const q = useGrades()
  return { isPending: q.isPending, options: q.data?.map((g) => ({ value: g.id, label: g.name })) }
}

export function useSectionOptions() {
  const grades = useGrades()
  const sections = useSections()
  const name = new Map(grades.data?.map((g) => [g.id, g.name]))
  return {
    isPending: grades.isPending || sections.isPending,
    options: sections.data?.map((s) => ({ value: s.id, label: `${name.get(s.grade_id) ?? "?"} - ${s.name}` })),
  }
}

export function useSubjectOptions() {
  const q = useSubjects()
  return { isPending: q.isPending, options: q.data?.map((s) => ({ value: s.id, label: s.name })) }
}
export function useYearOptions() {
  const q = useAcademicYears()
  return { isPending: q.isPending, options: q.data?.map((y) => ({ value: y.id, label: y.name })) }
}
export function useBranchOptions() {
  const q = useBranches()
  return { isPending: q.isPending, options: q.data?.map((b) => ({ value: b.id, label: b.name })) }
}
export function useStaffOptions() {
  const q = useStaff()
  return { isPending: q.isPending, options: q.data?.map((s) => ({ value: s.id, label: `${s.first_name} ${s.last_name}` })) }
}
