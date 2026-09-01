"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { useSelfAwarenessForms } from "@/hooks/use-self-awareness"
import { useStudents } from "@/hooks/use-students"
import type { Student } from "@/types/people"

import { SelfAwarenessFormSheet } from "./form-sheet"

export default function SelfAwarenessPage() {
  const { data: students, isPending } = useStudents()
  const { data: forms } = useSelfAwarenessForms()
  const [selected, setSelected] = React.useState<Student | null>(null)

  const formByStudent = new Map(forms?.map((f) => [f.student_id, f]))

  const columns: ColumnDef<Student>[] = [
    {
      id: "name",
      header: "Student",
      cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
    },
    { accessorKey: "admission_number", header: "Admission No." },
    {
      id: "goal",
      header: "Goal",
      cell: ({ row }) => formByStudent.get(row.original.id)?.goal ?? "—",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Self-Awareness Forms</h1>
        <p className="text-sm text-muted-foreground">
          Each student&apos;s reflection on their goals, strengths, interests, and
          responsibilities.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={students ?? []}
        isLoading={isPending}
        onRowClick={(row) => setSelected(row)}
        emptyMessage="No students yet."
      />

      <SelfAwarenessFormSheet
        key={selected?.id}
        student={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}
