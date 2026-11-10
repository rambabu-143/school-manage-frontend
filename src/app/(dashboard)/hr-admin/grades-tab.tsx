"use client"

import * as React from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { Field } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useDeleteStaffGrade, useLeaveTypes, useSaveStaffGrade, useStaffGrades } from "@/hooks/use-hr-admin"
import type { components } from "@/lib/api-types"

type G = components["schemas"]["StaffGradeRead"]
const EMPTY = {
  name: "", can_file_short_leave: false, max_short_leaves_per_month: "0", short_leave_deduction_allowed: false,
  short_leave_deduct_for_every: "1", short_leave_deduct: "0",
}

export function GradesTab() {
  const [year, setYear] = React.useState<string>()
  const grades = useStaffGrades(year)
  const types = useLeaveTypes()
  const save = useSaveStaffGrade()
  const del = useDeleteStaffGrade()
  const [edit, setEdit] = React.useState<{ id?: string } | null>(null)
  const [f, setF] = React.useState(EMPTY)
  const [quota, setQuota] = React.useState<Record<string, string>>({})
  const [rm, setRm] = React.useState<G | null>(null)

  const open = (g?: G) => {
    setF(g ? {
      name: g.name, can_file_short_leave: !!g.can_file_short_leave, max_short_leaves_per_month: String(g.max_short_leaves_per_month ?? 0),
      short_leave_deduction_allowed: !!g.short_leave_deduction_allowed, short_leave_deduct_for_every: String(g.short_leave_deduct_for_every ?? 1),
      short_leave_deduct: g.short_leave_deduct ?? "0",
    } : EMPTY)
    setQuota(Object.fromEntries((g?.leave_settings ?? []).map((s) => [s.leave_type_master_id, s.leave_quota])))
    setEdit({ id: g?.id })
  }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!year || !f.name.trim()) return
    const leave_settings = Object.entries(quota).filter(([, v]) => v !== "" && Number(v) >= 0).map(([leave_type_master_id, leave_quota]) => ({ leave_type_master_id, leave_quota }))
    const body = {
      name: f.name, academic_year_id: year, can_file_short_leave: f.can_file_short_leave,
      max_short_leaves_per_month: Number(f.max_short_leaves_per_month), short_leave_deduction_allowed: f.short_leave_deduction_allowed,
      short_leave_deduct_for_every: Number(f.short_leave_deduct_for_every), short_leave_deduct: f.short_leave_deduct, leave_settings,
    }
    save.mutate({ id: edit?.id, body }, { onSuccess: () => setEdit(null) })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Academic year"><AcademicYearSelect value={year} onChange={setYear} /></Field>
        <Button disabled={!year} onClick={() => open()}><Plus /> New staff grade</Button>
      </div>
      {!year ? <p className="text-sm text-muted-foreground">Select an academic year to see its staff grades.</p> : (
        <RowsTable
          rows={grades.data} isLoading={grades.isPending} error={grades.error} onRetry={() => grades.refetch()} empty="No staff grades for this year."
          columns={[
            { accessorKey: "name", header: "Grade" },
            { id: "sl", header: "Short leave", cell: ({ row }) => (row.original.can_file_short_leave ? `Up to ${row.original.max_short_leaves_per_month}/month` : "Not allowed") },
            { id: "ls", header: "Leave quotas", cell: ({ row }) => row.original.leave_settings.map((s) => `${types.data?.find((t) => t.id === s.leave_type_master_id)?.code ?? "?"}: ${s.leave_quota}`).join(", ") || "-" },
            {
              id: "actions", header: () => <span className="sr-only">Actions</span>,
              cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label={`Edit ${row.original.name}`} onClick={() => open(row.original)}><Pencil /></Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`Delete ${row.original.name}`} onClick={() => setRm(row.original)}><Trash2 /></Button>
                </div>
              ),
            },
          ]}
        />
      )}
      <Dialog open={!!edit} onOpenChange={(o) => !o && !save.isPending && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit staff grade" : "New staff grade"}</DialogTitle></DialogHeader>
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={f.can_file_short_leave} onCheckedChange={(c) => setF({ ...f, can_file_short_leave: !!c })} /> Can file short leave</label>
            <Field label="Max short leaves per month"><Input type="number" min={0} value={f.max_short_leaves_per_month} onChange={(e) => setF({ ...f, max_short_leaves_per_month: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={f.short_leave_deduction_allowed} onCheckedChange={(c) => setF({ ...f, short_leave_deduction_allowed: !!c })} /> Deduct for excess short leaves</label>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Deduct for every"><Input type="number" min={1} value={f.short_leave_deduct_for_every} onChange={(e) => setF({ ...f, short_leave_deduct_for_every: e.target.value })} /></Field>
              <Field label="Deduct (days)"><Input type="number" min={0} step="0.5" value={f.short_leave_deduct} onChange={(e) => setF({ ...f, short_leave_deduct: e.target.value })} /></Field>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Leave quotas</legend>
              {types.data?.length ? types.data.map((t) => (
                <Field key={t.id} label={`${t.name} (${t.code})`}>
                  <Input type="number" min={0} step="0.5" value={quota[t.id] ?? ""} placeholder="Not set" onChange={(e) => setQuota({ ...quota, [t.id]: e.target.value })} />
                </Field>
              )) : <p className="text-sm text-muted-foreground">Create leave types first.</p>}
            </fieldset>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!rm} onOpenChange={(o) => !o && setRm(null)} destructive isPending={del.isPending} confirmLabel="Delete"
        title="Delete staff grade?" description={rm ? `This deletes staff grade "${rm.name}" and its leave quotas. It is recorded in the audit log.` : ""}
        onConfirm={() => rm && del.mutate(rm.id, { onSettled: () => setRm(null) })}
      />
    </div>
  )
}
