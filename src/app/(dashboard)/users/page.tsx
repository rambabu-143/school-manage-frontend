"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { Badge } from "@/components/ui/badge"
import { useTenantUsers } from "@/hooks/use-tenant-users"
import { formatRole } from "@/lib/format-role"
import type { User } from "@/types/auth"

import { UserFormSheet } from "./user-form-sheet"

const columns: ColumnDef<User>[] = [
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => formatRole(row.original.role),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
]

export default function UsersPage() {
  const { data: users, isPending } = useTenantUsers()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Logins for this tenant. Staff and guardians are managed separately.
          </p>
        </div>
        <UserFormSheet />
      </div>

      <DataTable
        columns={columns}
        data={users ?? []}
        isLoading={isPending}
        emptyMessage="No users yet."
      />
    </div>
  )
}
