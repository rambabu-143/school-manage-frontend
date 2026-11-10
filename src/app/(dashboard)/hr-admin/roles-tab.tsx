"use client"

import * as React from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { Field, OptionSelect, staffName } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { StaffSelect } from "@/components/staff-select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  useApprover, useAssignRole, useDeleteLeaveRole, useLeaveRoles, useRoleAssignments, useSaveLeaveRole, useSetApprover, useUnassignRole,
} from "@/hooks/use-hr-admin"
import { useStaff } from "@/hooks/use-staff"
import type { components } from "@/lib/api-types"

type R = components["schemas"]["LeaveRoleRead"]

export function RolesTab() {
  const [year, setYear] = React.useState<string>()
  const roles = useLeaveRoles(year)
  const assigns = useRoleAssignments(year)
  const staff = useStaff()
  const saveRole = useSaveLeaveRole()
  const delRole = useDeleteLeaveRole()
  const assign = useAssignRole()
  const unassign = useUnassignRole()
  const setApprover = useSetApprover()

  const [edit, setEdit] = React.useState<{ id?: string } | null>(null)
  const [f, setF] = React.useState({ name: "", short_name: "", order: "1" })
  const [rm, setRm] = React.useState<R | null>(null)
  const [aStaff, setAStaff] = React.useState<string>()
  const [aRole, setARole] = React.useState<string>()
  const [aSenior, setASenior] = React.useState<string>()
  const [apStaff, setApStaff] = React.useState<string>()
  const [apSenior, setApSenior] = React.useState<string>()
  const current = useApprover(apStaff)

  const open = (r?: R) => { setF(r ? { name: r.name, short_name: r.short_name, order: String(r.order) } : { name: "", short_name: "", order: "1" }); setEdit({ id: r?.id }) }

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-xs"><Field label="Academic year"><AcademicYearSelect value={year} onChange={setYear} /></Field></div>
      {!year && <p className="text-sm text-muted-foreground">Select an academic year to manage leave roles.</p>}
      {year && (
        <>
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between"><h2 className="font-medium">Leave roles</h2><Button onClick={() => open()}><Plus /> New role</Button></div>
            <RowsTable rows={roles.data} isLoading={roles.isPending} error={roles.error} onRetry={() => roles.refetch()} empty="No leave roles yet."
              columns={[
                { accessorKey: "name", header: "Name" }, { accessorKey: "short_name", header: "Short" }, { accessorKey: "order", header: "Order" },
                { id: "a", header: () => <span className="sr-only">Actions</span>, cell: ({ row }) => (
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" aria-label={`Edit ${row.original.name}`} onClick={() => open(row.original)}><Pencil /></Button>
                    <Button variant="ghost" size="icon-sm" aria-label={`Delete ${row.original.name}`} onClick={() => setRm(row.original)}><Trash2 /></Button>
                  </div>) },
              ]} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-medium">Assign role to staff</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field label="Staff"><StaffSelect value={aStaff} onChange={setAStaff} /></Field>
              <Field label="Role"><OptionSelect label="Role" placeholder="Select role" value={aRole} onChange={setARole} options={(roles.data ?? []).map((r) => ({ value: r.id, label: r.name }))} /></Field>
              <Field label="Assessor (approver)"><StaffSelect value={aSenior} onChange={setASenior} /></Field>
              <Button disabled={!aStaff || !aRole || !aSenior || assign.isPending}
                onClick={() => assign.mutate({ staff_id: aStaff!, leave_role_id: aRole!, assessor_staff_id: aSenior! })}>Assign</Button>
            </div>
            <RowsTable rows={assigns.data} isLoading={assigns.isPending} error={assigns.error} onRetry={() => assigns.refetch()} empty="No role assignments."
              columns={[
                { id: "staff", header: "Staff", cell: ({ row }) => String((row.original as Record<string, unknown>).staff_name ?? staffName(staff.data, String((row.original as Record<string, unknown>).staff_id ?? ""))) },
                { id: "role", header: "Role", cell: ({ row }) => String((row.original as Record<string, unknown>).leave_role_name ?? (row.original as Record<string, unknown>).role_name ?? (row.original as Record<string, unknown>).leave_role_id ?? "-") },
                { id: "assessor", header: "Assessor", cell: ({ row }) => String((row.original as Record<string, unknown>).assessor_name ?? staffName(staff.data, String((row.original as Record<string, unknown>).assessor_staff_id ?? ""))) },
                { id: "a", header: () => <span className="sr-only">Actions</span>, cell: ({ row }) => {
                  const r = row.original as Record<string, unknown>
                  const s = String(r.staff_id ?? ""), lr = String(r.leave_role_id ?? "")
                  return <div className="flex justify-end"><Button variant="ghost" size="icon-sm" aria-label="Remove role assignment" disabled={!s || !lr} onClick={() => unassign.mutate({ staff_id: s, leave_role_id: lr })}><Trash2 /></Button></div>
                } },
              ]} />
          </section>
        </>
      )}

      <section className="flex flex-col gap-3 rounded-md border p-4">
        <h2 className="font-medium">Leave approver</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label="Staff"><StaffSelect value={apStaff} onChange={setApStaff} /></Field>
          <Field label="Approver"><StaffSelect value={apSenior} onChange={setApSenior} /></Field>
          <Button disabled={!apStaff || !apSenior || setApprover.isPending} onClick={() => setApprover.mutate({ staff_id: apStaff!, assessor_staff_id: apSenior! }, { onSuccess: () => current.refetch() })}>Save approver</Button>
        </div>
        {apStaff && <p className="text-sm text-muted-foreground" aria-live="polite">
          {current.isPending ? "Loading..." : current.data ? `Current approver: ${staffName(staff.data, current.data.assessor_staff_id)}` : "No approver set."}
        </p>}
      </section>

      <Dialog open={!!edit} onOpenChange={(o) => !o && !saveRole.isPending && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "Edit leave role" : "New leave role"}</DialogTitle></DialogHeader>
          <form className="flex flex-col gap-3" onSubmit={(e) => {
            e.preventDefault()
            if (!year || !f.name.trim() || !f.short_name.trim()) return
            saveRole.mutate({ id: edit?.id, body: { academic_year_id: year, name: f.name, short_name: f.short_name, order: Number(f.order) } }, { onSuccess: () => setEdit(null) })
          }}>
            <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
            <Field label="Short name"><Input value={f.short_name} onChange={(e) => setF({ ...f, short_name: e.target.value })} required /></Field>
            <Field label="Order"><Input type="number" min={0} value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} /></Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
              <Button type="submit" disabled={saveRole.isPending}>{saveRole.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!rm} onOpenChange={(o) => !o && setRm(null)} destructive isPending={delRole.isPending} confirmLabel="Delete"
        title="Delete leave role?" description={rm ? `This deletes leave role "${rm.name}" and its staff assignments. It is recorded in the audit log.` : ""}
        onConfirm={() => rm && delRole.mutate(rm.id, { onSettled: () => setRm(null) })} />
    </div>
  )
}
