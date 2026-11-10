"use client"

import * as React from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Field, OptionSelect } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useDeleteLeaveType, useLeaveTypes, useSaveLeaveType } from "@/hooks/use-hr-admin"
import type { components } from "@/lib/api-types"

type LT = components["schemas"]["LeaveTypeMasterRead"]
const EMPTY = { name: "", code: "", generation_base: "calendar_year", leave_quota: "0", allocate_in_jan: false, allocate_in_july: false }

export function LeaveConfigTab() {
  const q = useLeaveTypes()
  const save = useSaveLeaveType()
  const del = useDeleteLeaveType()
  const [edit, setEdit] = React.useState<{ id?: string } | null>(null)
  const [f, setF] = React.useState(EMPTY)
  const [rm, setRm] = React.useState<LT | null>(null)
  const open = (row?: LT) => {
    setF(row ? { name: row.name, code: row.code, generation_base: row.generation_base, leave_quota: row.leave_quota, allocate_in_jan: row.allocate_in_jan, allocate_in_july: row.allocate_in_july } : EMPTY)
    setEdit({ id: row?.id })
  }
  const valid = f.name.trim() && f.code.trim() && f.leave_quota !== "" && Number(f.leave_quota) >= 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end"><Button onClick={() => open()}><Plus /> New leave type</Button></div>
      <RowsTable
        rows={q.data}
        isLoading={q.isPending}
        error={q.error}
        onRetry={() => q.refetch()}
        empty="No leave types yet."
        columns={[
          { accessorKey: "name", header: "Name" },
          { accessorKey: "code", header: "Code" },
          { accessorKey: "generation_base", header: "Generated on" },
          { accessorKey: "leave_quota", header: "Quota" },
          { id: "alloc", header: "Allocation", cell: ({ row }) => [row.original.allocate_in_jan && "Jan", row.original.allocate_in_july && "Jul"].filter(Boolean).join(", ") || "-" },
          {
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon-sm" aria-label={`Edit ${row.original.name}`} onClick={() => open(row.original)}><Pencil /></Button>
                <Button variant="ghost" size="icon-sm" aria-label={`Delete ${row.original.name}`} onClick={() => setRm(row.original)}><Trash2 /></Button>
              </div>
            ),
          },
        ]}
      />
      <Dialog open={!!edit} onOpenChange={(o) => !o && !save.isPending && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "Edit leave type" : "New leave type"}</DialogTitle></DialogHeader>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (valid) save.mutate({ id: edit?.id, body: f as never }, { onSuccess: () => setEdit(null) })
            }}
          >
            <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
            <Field label="Code"><Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} required /></Field>
            <Field label="Quota (days)"><Input type="number" min={0} step="0.5" value={f.leave_quota} onChange={(e) => setF({ ...f, leave_quota: e.target.value })} /></Field>
            <Field label="Generated on">
              <OptionSelect label="Generated on" placeholder="Select" value={f.generation_base} onChange={(v) => setF({ ...f, generation_base: v })}
                options={[{ value: "calendar_year", label: "Calendar year" }, { value: "joining_date", label: "Joining date" }]} />
            </Field>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={f.allocate_in_jan} onCheckedChange={(c) => setF({ ...f, allocate_in_jan: !!c })} /> Allocate in January</label>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={f.allocate_in_july} onCheckedChange={(c) => setF({ ...f, allocate_in_july: !!c })} /> Allocate in July</label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
              <Button type="submit" disabled={!valid || save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!rm} onOpenChange={(o) => !o && setRm(null)} destructive isPending={del.isPending} confirmLabel="Delete"
        title="Delete leave type?"
        description={rm ? `This deletes leave type "${rm.name}" (${rm.code}). It is recorded in the audit log.` : ""}
        onConfirm={() => rm && del.mutate(rm.id, { onSettled: () => setRm(null) })}
      />
    </div>
  )
}
