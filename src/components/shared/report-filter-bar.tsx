"use client"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { BranchSelect } from "@/components/branch-select"
import { GradeSelect } from "@/components/grade-select"
import { SectionSelect } from "@/components/section-select"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useUrlParams } from "@/hooks/shared/use-url-params"
import { isIsoDate } from "@/lib/shared/url-params"

type FilterKey = "branch" | "year" | "grade" | "section" | "dates"
const PARAM = { branch: "branch_id", year: "academic_year_id", grade: "grade_id", section: "section_id" } as const

/** Read the same filters back (for query params) anywhere: useReportFilters(). */
export function useReportFilters() {
  const { get, set, params } = useUrlParams()
  const from = get("date_from")
  const to = get("date_to")
  return {
    values: {
      branch_id: get(PARAM.branch) ?? undefined,
      academic_year_id: get(PARAM.year) ?? undefined,
      grade_id: get(PARAM.grade) ?? undefined,
      section_id: get(PARAM.section) ?? undefined,
      date_from: isIsoDate(from) ? from : undefined,
      date_to: isIsoDate(to) ? to : undefined,
    },
    set,
    hasAny: ["branch_id", "academic_year_id", "grade_id", "section_id", "date_from", "date_to"].some((k) => params.has(k)),
  }
}

/** Filter bar whose state lives in the URL (shareable, back-button safe). Pick filters with `show`. */
export function ReportFilterBar({ show = ["branch", "year", "grade", "section", "dates"] }: { show?: FilterKey[] }) {
  const { values, set, hasAny } = useReportFilters()
  const has = (k: FilterKey) => show.includes(k)
  const field = (label: string, node: React.ReactNode) => (
    <div className="w-44 space-y-1"><Label>{label}</Label>{node}</div>
  )
  return (
    <div className="flex flex-wrap items-end gap-3" role="search" aria-label="Report filters">
      {has("branch") && field("Branch", <BranchSelect value={values.branch_id} onChange={(v) => set({ branch_id: v, grade_id: null, section_id: null })} />)}
      {has("year") && field("Academic year", <AcademicYearSelect value={values.academic_year_id} onChange={(v) => set({ academic_year_id: v })} />)}
      {has("grade") && field("Grade", <GradeSelect value={values.grade_id} branchId={values.branch_id} onChange={(v) => set({ grade_id: v, section_id: null })} />)}
      {has("section") && field("Section", <SectionSelect value={values.section_id} onChange={(v) => set({ section_id: v })} />)}
      {has("dates") && (
        <DateRangePicker from={values.date_from ?? null} to={values.date_to ?? null} onChange={(r) => set({ date_from: r.from, date_to: r.to })} />
      )}
      {hasAny && (
        <Button type="button" variant="ghost" onClick={() => set({ branch_id: null, academic_year_id: null, grade_id: null, section_id: null, date_from: null, date_to: null })}>
          Clear
        </Button>
      )}
    </div>
  )
}
