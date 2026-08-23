"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import type { Staff } from "@/types/people"

export const staffColumns: ColumnDef<Staff>[] = [
  {
    accessorKey: "employee_number",
    header: "Employee #",
  },
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
  },
  {
    accessorKey: "designation",
    header: "Designation",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email ?? "—",
  },
  {
    accessorKey: "date_of_joining",
    header: "Joined",
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
