"use client"

import * as React from "react"

import { DataTable } from "@/components/data-table/data-table"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDepartments } from "@/hooks/use-departments"
import { useStaff } from "@/hooks/use-staff"
import type { Staff } from "@/types/people"

import { DepartmentsTab } from "./departments-tab"
import { buildStaffColumns } from "./staff-columns"
import { StaffDetailSheet } from "./staff-detail-sheet"
import { StaffFormSheet } from "./staff-form-sheet"

function StaffTab() {
  const { data: staff, isPending } = useStaff()
  const { data: departments } = useDepartments()
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
        <p className="text-sm text-muted-foreground">
          {staff?.length ?? 0} staff member{staff?.length === 1 ? "" : "s"}
        </p>
        <StaffFormSheet />
      </div>

      <Input
        placeholder="Search by name, employee number, or designation..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      <DataTable
        columns={buildStaffColumns(departments)}
        data={filtered}
        isLoading={isPending}
        onRowClick={setSelected}
        emptyMessage="No staff yet."
      />

      <StaffDetailSheet staff={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  )
}

export default function StaffPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Staff</h1>
        <p className="text-sm text-muted-foreground">Employees and their departments.</p>
      </div>

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>
        <TabsContent value="staff">
          <StaffTab />
        </TabsContent>
        <TabsContent value="departments">
          <DepartmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
