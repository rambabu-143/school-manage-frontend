"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { ResultTable } from "@/components/ops/result-table"
import { StudentSelect } from "@/components/student-select"
import { apiClient } from "@/lib/api-client"
import { reportRows } from "@/lib/ops/form"
import { qk } from "@/lib/query-keys"
import { parseApiError } from "@/lib/shared/api-error"

/** Renewal form and transport interest for one student and year. 404 means "not filled yet". */
function Detail({ title, path, studentId, yearId }: { title: string; path: "form" | "interest"; studentId: string; yearId: string }) {
  const q = useQuery({
    queryKey: qk("ops", "student-transport", path, studentId, yearId),
    queryFn: async () => {
      try {
        const url = path === "form" ? `/transport-renewal-forms/student/${studentId}` : `/transport-interests/student/${studentId}`
        const { data } = await apiClient.get(url, { params: { academic_year_id: yearId } })
        return reportRows(data)
      } catch (e) {
        if (parseApiError(e).kind === "not_found") return []
        throw e
      }
    },
  })
  return (
    <section className="space-y-2">
      <h2 className="font-medium">{title}</h2>
      <ResultTable rows={q.data} isLoading={q.isPending} error={q.isError ? parseApiError(q.error).message : undefined} onRetry={() => q.refetch()} empty="Nothing recorded for this year." />
    </section>
  )
}

export default function Page() {
  const [student, setStudent] = useState<string>()
  const [year, setYear] = useState<string>()
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Student transport detail</h1>
      <div className="flex flex-wrap gap-3">
        <div className="w-64 space-y-1.5"><span className="text-sm font-medium">Student</span><StudentSelect value={student} onChange={setStudent} /></div>
        <div className="w-56 space-y-1.5"><span className="text-sm font-medium">Academic year</span><AcademicYearSelect value={year} onChange={setYear} /></div>
      </div>
      {student && year ? (
        <div className="space-y-6">
          <Detail title="Renewal form" path="form" studentId={student} yearId={year} />
          <Detail title="Transport interest" path="interest" studentId={student} yearId={year} />
        </div>
      ) : <p className="text-sm text-muted-foreground">Choose a student and academic year.</p>}
    </div>
  )
}
