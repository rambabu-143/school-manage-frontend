"use client"

import * as React from "react"

import { GradeSelect } from "@/components/grade-select"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStudents } from "@/hooks/use-students"
import type { Student } from "@/types/people"

import { studentColumns } from "./student-columns"
import { StudentDetailSheet } from "./student-detail-sheet"
import { StudentFormSheet } from "./student-form-sheet"

export default function StudentsPage() {
  const [gradeId, setGradeId] = React.useState<string>()
  const { data: students, isPending } = useStudents({ gradeId })
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
            {gradeId ? " in this grade" : ""}
          </p>
        </div>
        <StudentFormSheet />
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by name or admission number..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <div className="w-48">
          <GradeSelect value={gradeId} onChange={setGradeId} />
        </div>
        {gradeId && (
          <Button variant="ghost" size="sm" onClick={() => setGradeId(undefined)}>
            Clear
          </Button>
        )}
      </div>

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
