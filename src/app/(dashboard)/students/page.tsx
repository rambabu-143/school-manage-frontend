"use client"

import * as React from "react"

import { DataTable } from "@/components/data-table/data-table"
import { Input } from "@/components/ui/input"
import { useStudents } from "@/hooks/use-students"
import type { Student } from "@/types/people"

import { studentColumns } from "./student-columns"
import { StudentDetailSheet } from "./student-detail-sheet"
import { StudentFormSheet } from "./student-form-sheet"

export default function StudentsPage() {
  const { data: students, isPending } = useStudents()
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<Student | null>(null)

  const filtered = React.useMemo(() => {
    if (!students) return []
    const query = search.trim().toLowerCase()
    if (!query) return students
    return students.filter((student) =>
      `${student.first_name} ${student.last_name} ${student.admission_number}`
        .toLowerCase()
        .includes(query)
    )
  }, [students, search])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            {students?.length ?? 0} student{students?.length === 1 ? "" : "s"}
          </p>
        </div>
        <StudentFormSheet />
      </div>

      <Input
        placeholder="Search by name or admission number..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      <DataTable
        columns={studentColumns}
        data={filtered}
        isLoading={isPending}
        onRowClick={setSelected}
        emptyMessage="No students yet."
      />

      <StudentDetailSheet student={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  )
}
