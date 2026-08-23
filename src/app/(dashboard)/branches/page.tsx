"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { useSession } from "@/hooks/use-session"
import { useBranches } from "@/hooks/use-branches"
import { ADMIN_ROLES } from "@/types/auth"
import type { Branch } from "@/types/branches"

import { BranchFormSheet } from "./branch-form-sheet"

const columns: ColumnDef<Branch>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "code", header: "Code" },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => row.original.address ?? "—",
  },
]

export default function BranchesPage() {
  const { data: branches, isPending } = useBranches()
  const { data: user } = useSession()
  const canCreate = !!user && ADMIN_ROLES.includes(user.role)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Branches</h1>
          <p className="text-sm text-muted-foreground">
            {branches?.length ?? 0} branch{branches?.length === 1 ? "" : "es"}
          </p>
        </div>
        {canCreate && <BranchFormSheet />}
      </div>

      <DataTable
        columns={columns}
        data={branches ?? []}
        isLoading={isPending}
        emptyMessage="No branches yet."
      />
    </div>
  )
}
