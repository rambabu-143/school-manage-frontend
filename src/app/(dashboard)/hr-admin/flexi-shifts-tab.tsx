"use client"

import * as React from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { BranchSelect } from "@/components/branch-select"
import { Field, OptionSelect, StaffChecklist } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  useBulkAssignShift, useCreateFlexiSchedule, useDeleteFlexiMaster, useDeleteFlexiSchedule, useFlexiMasters, useFlexiSchedules, useSaveFlexiMaster,
} from "@/hooks/use-hr-admin"
import { toggleId, validRange, WEEKDAYS } from "@/lib/hr/rows"
import { useShifts } from "@/hooks/use-shifts"
import type { components } from "@/lib/api-types"

type M = components["schemas"]["FlexiShiftMasterRead"]
const SHIFT_TYPES = ["WORKING-HOUR", "WORKING-HOUR-WITH-IN-TIME", "IN-OUT"]
const EMPTY = { branch_id: "", name: "", code: "", shift_type: "IN-OUT", in_time: "", out_time: "", working_hours: "" }
const t = (v: string) => (v ? v : null)

export function FlexiShiftsTab() {
  const [year, setYear] = React.useState<string>()
  const masters = useFlexiMasters(year)
  const schedules = useFlexiSchedules()
  const shifts = useShifts()
  const save = useSaveFlexiMaster()
  const delM = useDeleteFlexiMaster()
  const create = useCreateFlexiSchedule()
  const delS = useDeleteFlexiSchedule()
  const [rmS, setRmS] = React.useState<{ id: string } | null>(null)
  const bulk = useBulkAssignShift()

  const [edit, setEdit] = React.useState<{ id?: string } | null>(null)
  const [f, setF] = React.useState(EMPTY)
  const [rm, setRm] = React.useState<M | null>(null)
  const [sShift, setSShift] = React.useState<string>()
  const [sStaff, setSStaff] = React.useState<string[]>([])
  const [sFrom, setSFrom] = React.useState("")
  const [sTo, setSTo] = React.useState("")
  const [days, setDays] = React.useState<string[]>([])
  const [bShift, setBShift] = React.useState<string>()
  const [bStaff, setBStaff] = React.useState<string[]>([])

  const open = (m?: M) => {
    setF(m ? { branch_id: m.branch_id, name: m.name, code: m.code, shift_type: m.shift_type, in_time: m.in_time ?? "", out_time: m.out_time ?? "", working_hours: m.working_hours ?? "" } : EMPTY)
    setEdit({ id: m?.id })
  }
  const canSchedule = !!sShift && sStaff.length > 0 && validRange(sFrom, sTo) && days.length > 0

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Academic year"><AcademicYearSelect value={year} onChange={setYear} /></Field>
          <Button disabled={!year} onClick={() => open()}><Plus /> New flexi shift</Button>
        </div>
        <RowsTable rows={masters.data} isLoading={masters.isPending} error={masters.error} onRetry={() => masters.refetch()} empty="No flexi shifts."
          columns={[
            { accessorKey: "name", header: "Name" }, { accessorKey: "code", header: "Code" }, { accessorKey: "shift_type", header: "Type" },
            { id: "h", header: "Hours", cell: ({ row }) => `${row.original.in_time?.slice(0, 5) ?? "-"} - ${row.original.out_time?.slice(0, 5) ?? "-"}` },
            { id: "a", header: () => <span className="sr-only">Actions</span>, cell: ({ row }) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon-sm" aria-label={`Edit ${row.original.name}`} onClick={() => open(row.original)}><Pencil /></Button>
                <Button variant="ghost" size="icon-sm" aria-label={`Delete ${row.original.name}`} onClick={() => setRm(row.original)}><Trash2 /></Button>
              </div>) },
          ]} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Schedule flexi shift for staff</h2>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Flexi shift"><OptionSelect label="Flexi shift" placeholder="Select" value={sShift} onChange={setSShift} options={(masters.data ?? []).map((m) => ({ value: m.id, label: m.name }))} /></Field>
          <Field label="From"><Input type="date" value={sFrom} onChange={(e) => setSFrom(e.target.value)} /></Field>
          <Field label="To"><Input type="date" value={sTo} onChange={(e) => setSTo(e.target.value)} /></Field>
        </div>
        <div className="flex flex-wrap gap-3" role="group" aria-label="Days">
          {WEEKDAYS.map((d) => <label key={d} className="flex items-center gap-1 text-sm"><Checkbox checked={days.includes(d)} onCheckedChange={() => setDays(toggleId(days, d))} />{d.slice(0, 3)}</label>)}
        </div>
        <StaffChecklist value={sStaff} onChange={setSStaff} />
        <div><Button disabled={!canSchedule || create.isPending} onClick={() => create.mutate({ shift_id: sShift!, staff_ids: sStaff, from_date: sFrom, to_date: sTo, days: days as never }, { onSuccess: () => setSStaff([]) })}>Create schedule</Button></div>
        <RowsTable rows={schedules.data} isLoading={schedules.isPending} error={schedules.error} onRetry={() => schedules.refetch()} empty="No schedules."
          columns={[
            { id: "s", header: "Shift", cell: ({ row }) => masters.data?.find((m) => m.id === row.original.shift_id)?.name ?? row.original.shift_id.slice(0, 8) },
            { id: "d", header: "Dates", cell: ({ row }) => `${row.original.from_date} to ${row.original.to_date}` },
            { id: "w", header: "Days", cell: ({ row }) => row.original.days.map((d) => d.slice(0, 3)).join(", ") },
            { id: "n", header: "Staff", cell: ({ row }) => row.original.staff_ids.length },
            { id: "a", header: () => <span className="sr-only">Actions</span>, cell: ({ row }) => <div className="flex justify-end"><Button variant="ghost" size="icon-sm" aria-label="Delete schedule" onClick={() => setRmS(row.original)}><Trash2 /></Button></div> },
          ]} />
      </section>

      <section className="flex flex-col gap-3 rounded-md border p-4">
        <h2 className="font-medium">Assign fixed shift to staff in bulk</h2>
        <Field label="Shift"><OptionSelect label="Shift" placeholder="Select" value={bShift} onChange={setBShift} options={(shifts.data ?? []).map((s) => ({ value: s.id, label: s.name }))} /></Field>
        <StaffChecklist value={bStaff} onChange={setBStaff} />
        <div><Button disabled={!bShift || !bStaff.length || bulk.isPending} onClick={() => bulk.mutate({ shift_id: bShift!, staff_ids: bStaff }, { onSuccess: () => setBStaff([]) })}>Assign {bStaff.length || ""} staff</Button></div>
      </section>

      <Dialog open={!!edit} onOpenChange={(o) => !o && !save.isPending && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit flexi shift" : "New flexi shift"}</DialogTitle></DialogHeader>
          <form className="flex flex-col gap-3" onSubmit={(e) => {
            e.preventDefault()
            if (!year || !f.name.trim() || !f.code.trim() || !f.branch_id) return
            save.mutate({ id: edit?.id, body: { branch_id: f.branch_id, academic_year_id: year, name: f.name, code: f.code, shift_type: f.shift_type as never, in_time: t(f.in_time), out_time: t(f.out_time), working_hours: t(f.working_hours) } }, { onSuccess: () => setEdit(null) })
          }}>
            <Field label="Branch"><BranchSelect value={f.branch_id || undefined} onChange={(v) => setF({ ...f, branch_id: v })} /></Field>
            <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
            <Field label="Code"><Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} required /></Field>
            <Field label="Type"><OptionSelect label="Type" placeholder="Select" value={f.shift_type} onChange={(v) => setF({ ...f, shift_type: v })} options={SHIFT_TYPES.map((s) => ({ value: s, label: s }))} /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="In"><Input type="time" value={f.in_time} onChange={(e) => setF({ ...f, in_time: e.target.value })} /></Field>
              <Field label="Out"><Input type="time" value={f.out_time} onChange={(e) => setF({ ...f, out_time: e.target.value })} /></Field>
              <Field label="Hours"><Input type="time" value={f.working_hours} onChange={(e) => setF({ ...f, working_hours: e.target.value })} /></Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!rm} onOpenChange={(o) => !o && setRm(null)} destructive isPending={delM.isPending} confirmLabel="Delete"
        title="Delete flexi shift?" description={rm ? `This deletes flexi shift "${rm.name}". It is recorded in the audit log.` : ""}
        onConfirm={() => rm && delM.mutate(rm.id, { onSettled: () => setRm(null) })} />
      <ConfirmDialog open={!!rmS} onOpenChange={(o) => !o && setRmS(null)} destructive isPending={delS.isPending} confirmLabel="Delete"
        title="Delete schedule?" description="This deletes the flexi shift schedule. It is recorded in the audit log."
        onConfirm={() => rmS && delS.mutate(rmS.id, { onSettled: () => setRmS(null) })} />
    </div>
  )
}
