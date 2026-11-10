"use client"

import { Suspense } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ReportFilterBar, useReportFilters } from "@/components/shared/report-filter-bar"
import { ServerDataTable } from "@/components/shared/server-data-table"
import { useTransportAttendance } from "@/hooks/use-attendance-admin"
import { parseApiError } from "@/lib/shared/api-error"

function Body() {
  const { values: f } = useReportFilters()
  const q = useTransportAttendance({ grade_id: f.grade_id, section_id: f.section_id, date_from: f.date_from, date_to: f.date_to })
  const columns: ColumnDef<NonNullable<typeof q.data>[number], unknown>[] = [
    { accessorKey: "date", header: "Date" }, { accessorKey: "student_id", header: "Student" },
    { accessorKey: "status", header: "Status" }, { accessorKey: "day_type", header: "Day type" },
  ]
  return (
    <div className="space-y-4">
      <ReportFilterBar show={["branch", "grade", "section", "dates"]} />
      {(!(f.grade_id || f.section_id) || !f.date_from || !f.date_to) && <p className="text-sm text-muted-foreground">Pick a grade or section and a date range.</p>}
      <ServerDataTable columns={columns} rows={q.data} isLoading={q.isFetching && !q.data} error={q.isError ? parseApiError(q.error).message : null} onRetry={() => q.refetch()} emptyMessage="No transport attendance." />
    </div>
  )
}

export default function TransportAttendancePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Transport attendance</h1>
      <Suspense><Body /></Suspense>
    </div>
  )
}
