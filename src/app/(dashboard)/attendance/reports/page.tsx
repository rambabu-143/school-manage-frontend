"use client"

import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"

import { ReportFilterBar, useReportFilters } from "@/components/shared/report-filter-bar"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/typed-api"
import { qk } from "@/lib/query-keys"
import { parseApiError } from "@/lib/shared/api-error"
import { downloadText, toCsv } from "@/lib/shared/calendar"

function Body() {
  const { values: f } = useReportFilters()
  const day = f.date_from
  const q = useQuery({
    queryKey: qk("attendance-reports", "daily", day, f.academic_year_id, f.branch_id),
    queryFn: () => api("get", "/report/attendance/daily-report/{day}", { path: { day: day! }, query: { academic_year_id: f.academic_year_id!, branch_id: f.branch_id } }),
    enabled: !!day && !!f.academic_year_id,
  })
  const rows = (Array.isArray(q.data) ? q.data : []) as Record<string, unknown>[]
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))]
  return (
    <div className="space-y-4">
      <ReportFilterBar show={["branch", "year", "dates"]} />
      <p className="text-sm text-muted-foreground">Daily school report for the start date selected. The backend returns JSON only, so Download exports the table as CSV in your browser.</p>
      {(!day || !f.academic_year_id) && <p className="text-sm text-muted-foreground">Pick an academic year and a date.</p>}
      {q.isError && <p role="alert" className="text-sm text-destructive">{parseApiError(q.error).message} <Button size="sm" variant="outline" onClick={() => q.refetch()}>Retry</Button></p>}
      {q.isFetching && !q.data && <p className="text-sm text-muted-foreground">Loading...</p>}
      {q.data && rows.length === 0 && <p className="text-sm text-muted-foreground">No data for this day.</p>}
      {rows.length > 0 && (
        <>
          <Button variant="outline" onClick={() => downloadText(`attendance-${day}.csv`, toCsv(rows))}>Download CSV</Button>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead><tr>{keys.map((k) => <th key={k} scope="col" className="px-3 py-2 text-left font-medium">{k}</th>)}</tr></thead>
              <tbody>{rows.map((r, i) => <tr key={i} className="border-t">{keys.map((k) => <td key={k} className="px-3 py-2">{typeof r[k] === "object" ? JSON.stringify(r[k]) : String(r[k] ?? "")}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default function AttendanceReportsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Attendance reports</h1>
      <Suspense><Body /></Suspense>
    </div>
  )
}
