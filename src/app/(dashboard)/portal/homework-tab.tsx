"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { useMyChildHomework } from "@/hooks/use-homework"
import { useSubjects } from "@/hooks/use-subjects"
import type { HomeworkAssignment } from "@/types/homework"

export function HomeworkTab({ studentId }: { studentId: string }) {
  const { data: homework, isPending } = useMyChildHomework(studentId)
  const { data: subjects } = useSubjects()

  const columns: ColumnDef<HomeworkAssignment>[] = [
    { accessorKey: "title", header: "Title" },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => subjects?.find((s) => s.id === row.original.subject_id)?.name ?? "—",
    },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "due_date", header: "Due date" },
  ]

  return (
    <DataTable
      columns={columns}
      data={homework ?? []}
      isLoading={isPending}
      emptyMessage="No homework assigned yet."
    />
  )
}
