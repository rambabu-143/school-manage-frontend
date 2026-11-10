"use client"

import * as React from "react"
import { Check, Plus, Trash2, X } from "lucide-react"

import { Field, OptionSelect, staffName } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { StaffSelect } from "@/components/staff-select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateLeaveOnBehalf, useHrDeleteLeave, useLeaveApplicationsAdmin, useUpdateLeaveStatus } from "@/hooks/use-hr-admin"
import { useStaff } from "@/hooks/use-staff"
import { validRange } from "@/lib/hr/rows"
import type { components } from "@/lib/api-types"

type App = components["schemas"]["LeaveApplicationRead"]
const TYPES = ["casual", "sick", "earned", "unpaid", "short_leave", "comp_off", "on_duty"] as const
const STATUSES = ["pending", "approved", "rejected"]
const EMPTY = { staff_id: "", leave_type: "casual", start_date: "", end_date: "", reason: "", no_of_days: "", period: "" }

export function ApplicationsTab() {
  const [status, setStatus] = React.useState<string>()
  const [staffFilter, setStaffFilter] = React.useState<string>()
  const apps = useLeaveApplicationsAdmin({ status, staff_id: staffFilter })
  const staff = useStaff()
  const create = useCreateLeaveOnBehalf()
  const update = useUpdateLeaveStatus()
  const del = useHrDeleteLeave()
  const [open, setOpen] = React.useState(false)
  const [f, setF] = React.useState(EMPTY)
  const [review, setReview] = React.useState<{ app: App; action: "approve" | "reject" } | null>(null)
  const [comment, setComment] = React.useState("")
  const [rm, setRm] = React.useState<App | null>(null)
  const valid = f.staff_id && f.reason.trim() && validRange(f.start_date, f.end_date)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Status"><OptionSelect label="Status" placeholder="All" value={status} onChange={(v) => setStatus(v === "all" ? undefined : v)}
          options={[{ value: "all", label: "All" }, ...STATUSES.map((s) => ({ value: s, label: s }))]} /></Field>
        <Field label="Staff"><StaffSelect value={staffFilter} onChange={setStaffFilter} /></Field>
        {staffFilter && <Button variant="outline" onClick={() => setStaffFilter(undefined)}>Clear staff</Button>}
        <Button onClick={() => { setF(EMPTY); setOpen(true) }}><Plus /> Apply on behalf</Button>
      </div>
      <RowsTable rows={apps.data} isLoading={apps.isPending} error={apps.error} onRetry={() => apps.refetch()} empty="No leave applications."
        columns={[
          { id: "staff", header: "Staff", cell: ({ row }) => staffName(staff.data, row.original.staff_id) },
          { accessorKey: "leave_type", header: "Type" },
          { id: "dates", header: "Dates", cell: ({ row }) => `${row.original.start_date} to ${row.original.end_date}` },
          { accessorKey: "reason", header: "Reason" },
          { id: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "approved" ? "default" : "secondary"}>{row.original.status}</Badge> },
          { id: "a", header: () => <span className="sr-only">Actions</span>, cell: ({ row }) => (
            <div className="flex justify-end gap-1">
              {row.original.status === "pending" && <>
                <Button variant="ghost" size="icon-sm" aria-label={`Approve leave for ${staffName(staff.data, row.original.staff_id)}, ${row.original.start_date} to ${row.original.end_date}`} onClick={() => { setComment(""); setReview({ app: row.original, action: "approve" }) }}><Check /></Button>
                <Button variant="ghost" size="icon-sm" aria-label={`Reject leave for ${staffName(staff.data, row.original.staff_id)}, ${row.original.start_date} to ${row.original.end_date}`} onClick={() => { setComment(""); setReview({ app: row.original, action: "reject" }) }}><X /></Button>
              </>}
              <Button variant="ghost" size="icon-sm" aria-label="Delete application" onClick={() => setRm(row.original)}><Trash2 /></Button>
            </div>) },
        ]} />

      <Dialog open={open} onOpenChange={(o) => !o && !create.isPending && setOpen(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Apply leave on behalf</DialogTitle></DialogHeader>
          <form className="flex flex-col gap-3" onSubmit={(e) => {
            e.preventDefault()
            if (!valid) return
            create.mutate({
              staff_id: f.staff_id, leave_type: f.leave_type as never, start_date: f.start_date, end_date: f.end_date, reason: f.reason,
              no_of_days: f.no_of_days || null, period: (f.period || null) as never,
            }, { onSuccess: () => setOpen(false) })
          }}>
            <Field label="Staff"><StaffSelect value={f.staff_id || undefined} onChange={(v) => setF({ ...f, staff_id: v })} /></Field>
            <Field label="Leave type"><OptionSelect label="Leave type" placeholder="Select" value={f.leave_type} onChange={(v) => setF({ ...f, leave_type: v })} options={TYPES.map((t) => ({ value: t, label: t }))} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date"><Input type="date" value={f.start_date} onChange={(e) => setF({ ...f, start_date: e.target.value })} /></Field>
              <Field label="End date"><Input type="date" value={f.end_date} onChange={(e) => setF({ ...f, end_date: e.target.value })} /></Field>
            </div>
            {f.start_date && f.end_date && !validRange(f.start_date, f.end_date) && <p role="alert" className="text-sm text-destructive">End date must not be before start date.</p>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Days (optional)"><Input type="number" min={0} step="0.5" value={f.no_of_days} onChange={(e) => setF({ ...f, no_of_days: e.target.value })} /></Field>
              <Field label="Half day (optional)"><OptionSelect label="Half day" placeholder="Full day" value={f.period || undefined} onChange={(v) => setF({ ...f, period: v === "none" ? "" : v })}
                options={[{ value: "none", label: "Full day" }, { value: "FIRST-HALF", label: "First half" }, { value: "SECOND-HALF", label: "Second half" }]} /></Field>
            </div>
            <Field label="Reason"><Textarea value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!valid || create.isPending}>{create.isPending ? "Saving..." : "Submit"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!review} onOpenChange={(o) => !o && !update.isPending && setReview(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{review?.action === "approve" ? "Approve" : "Reject"} leave</DialogTitle></DialogHeader>
          <Field label="Comment (optional)"><Textarea value={comment} onChange={(e) => setComment(e.target.value)} /></Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReview(null)}>Cancel</Button>
            <Button disabled={update.isPending} onClick={() => review && update.mutate({ id: review.app.id, action: review.action, comment }, { onSuccess: () => setReview(null) })}>
              {update.isPending ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!rm} onOpenChange={(o) => !o && setRm(null)} destructive isPending={del.isPending} confirmLabel="Delete"
        title="Delete leave application?" description={rm ? `This removes the ${rm.leave_type} application of ${staffName(staff.data, rm.staff_id)} (${rm.start_date} to ${rm.end_date}) and restores their balance. It is recorded in the audit log.` : ""}
        onConfirm={() => rm && del.mutate(rm.id, { onSettled: () => setRm(null) })} />
    </div>
  )
}
