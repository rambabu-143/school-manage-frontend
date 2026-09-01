"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import type { Department } from "@/types/departments"
import type { Staff } from "@/types/people"

export function buildStaffColumns(departments: Department[] | undefined): ColumnDef<Staff>[] {
  return [
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
      id: "department",
      header: "Department",
      cell: ({ row }) =>
        departments?.find((d) => d.id === row.original.department_id)?.name ?? "—",
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
}
