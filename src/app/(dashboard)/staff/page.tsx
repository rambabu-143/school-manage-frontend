"use client"

import * as React from "react"

import { DataTable } from "@/components/data-table/data-table"
import { Input } from "@/components/ui/input"
import { useStaff } from "@/hooks/use-staff"
import type { Staff } from "@/types/people"

import { staffColumns } from "./staff-columns"
import { StaffDetailSheet } from "./staff-detail-sheet"
import { StaffFormSheet } from "./staff-form-sheet"

export default function StaffPage() {
  const { data: staff, isPending } = useStaff()
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<Staff | null>(null)

  const filtered = React.useMemo(() => {
    if (!staff) return []
    const query = search.trim().toLowerCase()
    if (!query) return staff
    return staff.filter((member) =>
      `${member.first_name} ${member.last_name} ${member.employee_number} ${member.designation}`
        .toLowerCase()
        .includes(query)
    )
  }, [staff, search])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Staff</h1>
          <p className="text-sm text-muted-foreground">
            {staff?.length ?? 0} staff member{staff?.length === 1 ? "" : "s"}
          </p>
        </div>
        <StaffFormSheet />
      </div>

      <Input
        placeholder="Search by name, employee number, or designation..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      <DataTable
        columns={staffColumns}
        data={filtered}
        isLoading={isPending}
        onRowClick={setSelected}
        emptyMessage="No staff yet."
      />

      <StaffDetailSheet staff={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  )
}
