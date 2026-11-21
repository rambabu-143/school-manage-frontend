"use client"

import * as React from "react"

import { Field, StaffChecklist, staffName } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { StaffSelect } from "@/components/staff-select"
import { Button } from "@/components/ui/button"
import { useHouses } from "@/hooks/use-houses"
import { useAddHouseTeacher, useHouseIncharge, useHouseTeachers, useRemoveHouseTeacher, useSetHouseIncharge } from "@/hooks/use-teacher-assignment"
import { useStaff } from "@/hooks/use-staff"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

export function HousesTab({ canEdit }: { canEdit: boolean }) {
  const incharge = useHouseIncharge()
  const teachers = useHouseTeachers()
  const houses = useHouses()
  const staff = useStaff()
  const setIn = useSetHouseIncharge()
  const add = useAddHouseTeacher()
  const [rmT, setRmT] = React.useState<{ id: string; staff_name: string } | null>(null)
  const rm = useRemoveHouseTeacher()
  const [house, setHouse] = React.useState<string>()
  const [ids, setIds] = React.useState<string[]>([])
  const [tHouse, setTHouse] = React.useState<string>()
  const [tStaff, setTStaff] = React.useState<string>()
  const houseSelect = (v: string | undefined, on: (x: string | undefined) => void, label: string) => (
    <select aria-label={label} className="h-9 rounded-md border bg-background px-2 text-sm" value={v ?? ""} onChange={(e) => on(e.target.value || undefined)}>
      <option value="">Select</option>
      {houses.data?.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
    </select>
  )

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="font-medium">House in-charge</h2>
        <RowsTable rows={incharge.data} isLoading={incharge.isPending} error={incharge.error} onRetry={() => incharge.refetch()} empty="No houses."
          columns={[{ accessorKey: "name", header: "House" }, { id: "s", header: "In-charge", cell: ({ row }) => row.original.incharge_staff_ids.map((i) => staffName(staff.data, i)).join(", ") || "-" }]} />
        {canEdit && (
          <div className="flex flex-col gap-3 rounded-md border p-4">
            <Field label="House">{houseSelect(house, setHouse, "House")}</Field>
            <StaffChecklist value={ids} onChange={setIds} />
            <div className="flex gap-2">
              <Button disabled={!house || !ids.length || setIn.isPending} onClick={() => setIn.mutate({ house_id: house!, type: "ASSIGN", staff_ids: ids }, { onSuccess: () => setIds([]) })}>Assign</Button>
              <Button variant="outline" disabled={!house || !ids.length || setIn.isPending} onClick={() => setIn.mutate({ house_id: house!, type: "UNASSIGN", staff_ids: ids }, { onSuccess: () => setIds([]) })}>Unassign</Button>
            </div>
          </div>
        )}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-medium">House teachers</h2>
        {canEdit && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="House">{houseSelect(tHouse, setTHouse, "House for teacher")}</Field>
            <Field label="Teacher"><StaffSelect value={tStaff} onChange={setTStaff} /></Field>
            <Button disabled={!tHouse || !tStaff || add.isPending} onClick={() => add.mutate({ house_id: tHouse!, staff_id: tStaff! })}>Add</Button>
          </div>
        )}
        <RowsTable rows={teachers.data} isLoading={teachers.isPending} error={teachers.error} onRetry={() => teachers.refetch()} empty="No house teachers."
          columns={[
            { accessorKey: "house_name", header: "House" }, { accessorKey: "staff_name", header: "Teacher" },
            ...(canEdit ? [{ id: "a", header: () => <span className="sr-only">Actions</span>, cell: ({ row }: { row: { original: { id: string; staff_name: string } } }) => (
              <div className="flex justify-end"><Button size="sm" variant="ghost" aria-label={`Remove ${row.original.staff_name}`} onClick={() => setRmT(row.original)}>Remove</Button></div>) }] : []),
          ]} />
      </section>
      <ConfirmDialog open={!!rmT} onOpenChange={(o) => !o && setRmT(null)} destructive isPending={rm.isPending} confirmLabel="Remove"
        title="Remove house teacher?" description={rmT ? `This removes ${rmT.staff_name} as house teacher.` : ""}
        onConfirm={() => rmT && rm.mutate(rmT.id, { onSettled: () => setRmT(null) })} />
    </div>
  )
}
