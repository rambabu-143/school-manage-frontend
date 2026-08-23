"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import type { Student } from "@/types/people"

export const studentColumns: ColumnDef<Student>[] = [
  {
    accessorKey: "admission_number",
    header: "Admission #",
  },
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => row.original.gender ?? "—",
  },
  {
    accessorKey: "enrollment_date",
    header: "Enrolled",
  },
  {
    id: "guardians",
    header: "Guardians",
    cell: ({ row }) => row.original.guardians.length,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge variant="secondary">Active</Badge>
      ) : (
        <Badge variant="outline">Inactive</Badge>
      ),
  },
]
