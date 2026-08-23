"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { SectionSelect } from "@/components/section-select"
import { DataTable } from "@/components/data-table/data-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSectionAttendanceSummary } from "@/hooks/use-student-attendance"
import type { StudentAttendanceSummary } from "@/types/attendance"

function firstDayOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

const columns: ColumnDef<StudentAttendanceSummary>[] = [
  {
    id: "student",
    header: "Student",
    cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
  },
  { accessorKey: "present", header: "Present" },
  { accessorKey: "absent", header: "Absent" },
  { accessorKey: "late", header: "Late" },
  { accessorKey: "half_day", header: "Half day" },
  { accessorKey: "excused", header: "Excused" },
  { accessorKey: "total", header: "Total" },
]

export function SummaryTab() {
  const [sectionId, setSectionId] = React.useState<string>()
  const [dateFrom, setDateFrom] = React.useState(firstDayOfMonth)
  const [dateTo, setDateTo] = React.useState(today)

  const { data: summary, isPending } = useSectionAttendanceSummary(sectionId, {
    dateFrom,
    dateTo,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label>Section</Label>
          <SectionSelect value={sectionId} onChange={setSectionId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>From</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>To</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      {sectionId ? (
        <DataTable
          columns={columns}
          data={summary ?? []}
          isLoading={isPending}
          emptyMessage="No attendance records for this range."
        />
      ) : (
        <p className="text-sm text-muted-foreground">Select a section to view its summary.</p>
      )}
    </div>
  )
}
