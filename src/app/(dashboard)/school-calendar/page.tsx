"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ReportFilterBar, useReportFilters } from "@/components/shared/report-filter-bar"
import { ServerDataTable } from "@/components/shared/server-data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCalendarEvents, useCalendarHolidays, useSave } from "@/hooks/use-attendance-admin"
import { useListParams } from "@/hooks/shared/use-url-params"
import { useSession } from "@/hooks/use-session"
import { api } from "@/lib/typed-api"
import { parseApiError } from "@/lib/shared/api-error"
import { HEX_COLOR } from "@/lib/shared/calendar"
import { ADMIN_ROLES } from "@/types/auth"

const schema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  title: z.string().trim().min(1, "Title is required").max(200),
  event_for: z.enum(["student", "staff", "both"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  primary_color: z.string().regex(HEX_COLOR, "Use a hex colour like #3366ff"),
  secondary_color: z.string().regex(HEX_COLOR, "Use a hex colour like #ffffff"),
  location: z.string().max(200).optional(),
  remark: z.string().max(1000).optional(),
}).refine((v) => v.end_date >= v.start_date, { path: ["end_date"], message: "End must be on or after start" })
type Form = z.infer<typeof schema>
type Ev = { id: string } & Omit<Form, "location" | "remark"> & { location: string | null; remark: string | null; academic_year_id: string }
const blank: Form = { branch_id: "", title: "", event_for: "both", start_date: "", end_date: "", primary_color: "#3366ff", secondary_color: "#ffffff" }

function EventDialog({ ev, onClose }: { ev: Ev | "new"; onClose: () => void }) {
  const { values: f } = useReportFilters()
  const [v, setV] = useState<Form>(ev === "new" ? { ...blank, branch_id: f.branch_id ?? "" } : { ...ev, location: ev.location ?? "", remark: ev.remark ?? "" })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const save = useSave<Form>("calendar-events", (b) =>
    ev === "new" ? api("post", "/school-calendar", { body: { ...b, academic_year_id: f.academic_year_id ?? null, location: b.location || null, remark: b.remark || null } })
      : api("put", "/school-calendar/{event_id}", { path: { event_id: ev.id }, body: { ...b, location: b.location || null, remark: b.remark || null } }), "Event saved", onClose)
  const set = (k: keyof Form, val: string) => setV((p) => ({ ...p, [k]: val }))
  const fld = (k: keyof Form, label: string, type = "text") => (
    <div className="space-y-1"><Label htmlFor={`ev-${k}`}>{label}</Label>
      <Input id={`ev-${k}`} type={type} value={(v[k] as string) ?? ""} aria-invalid={!!errs[k]} onChange={(e) => set(k, e.target.value)} />
      {errs[k] && <p role="alert" className="text-sm text-destructive">{errs[k]}</p>}</div>
  )
  return (
    <Dialog open onOpenChange={(o) => !o && !save.isPending && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{ev === "new" ? "New event" : "Edit event"}</DialogTitle></DialogHeader>
        <form className="space-y-3" noValidate onSubmit={(e) => {
          e.preventDefault()
          const r = schema.safeParse(v)
          if (!r.success) { setErrs(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]))); return }
          setErrs({}); save.mutate(r.data)
        }}>
          {ev === "new" && <div className="space-y-1"><Label>Branch</Label><BranchSelect value={v.branch_id || undefined} onChange={(b) => set("branch_id", b)} />{errs.branch_id && <p role="alert" className="text-sm text-destructive">{errs.branch_id}</p>}</div>}
          {fld("title", "Title")}
          <div className="space-y-1"><Label htmlFor="ev-for">For</Label>
            <select id="ev-for" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={v.event_for} onChange={(e) => set("event_for", e.target.value)}>
              <option value="both">Students and staff</option><option value="student">Students</option><option value="staff">Staff</option>
            </select></div>
          <div className="grid grid-cols-2 gap-3">{fld("start_date", "Start", "date")}{fld("end_date", "End", "date")}</div>
          <div className="grid grid-cols-2 gap-3">
            {(["primary_color", "secondary_color"] as const).map((k) => (
              <div key={k} className="space-y-1"><Label htmlFor={`ev-${k}`}>{k === "primary_color" ? "Primary colour" : "Secondary colour"}</Label>
                <div className="flex gap-2">
                  <input aria-label={`${k} picker`} type="color" className="h-9 w-10 rounded border" value={HEX_COLOR.test(v[k]) && v[k].length === 7 ? v[k] : "#000000"} onChange={(e) => set(k, e.target.value)} />
                  <Input id={`ev-${k}`} value={v[k]} aria-invalid={!!errs[k]} onChange={(e) => set(k, e.target.value)} />
                </div>{errs[k] && <p role="alert" className="text-sm text-destructive">{errs[k]}</p>}</div>
            ))}
          </div>
          {fld("location", "Location")}{fld("remark", "Remark")}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={save.isPending} onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Events() {
  const { values: f } = useReportFilters()
  const lp = useListParams()
  const { data: user } = useSession()
  const admin = !!user && ADMIN_ROLES.includes(user.role)
  const q = useCalendarEvents({ branch_id: f.branch_id, academic_year_id: f.academic_year_id, page: lp.page, limit: lp.limit })
  const [editing, setEditing] = useState<Ev | "new" | null>(null)
  const [deleting, setDeleting] = useState<Ev | null>(null)
  const del = useSave<Ev>("calendar-events", (e) => api("delete", "/school-calendar/{event_id}", { path: { event_id: e.id } }), "Event deleted", () => setDeleting(null))
  const columns: ColumnDef<Ev, unknown>[] = [
    { accessorKey: "title", header: "Title", cell: ({ row }) => <span className="inline-flex items-center gap-2"><span aria-hidden className="size-3 rounded-full border" style={{ background: row.original.primary_color }} />{row.original.title}</span> },
    { accessorKey: "event_for", header: "For" }, { accessorKey: "start_date", header: "Start" }, { accessorKey: "end_date", header: "End" },
    { accessorKey: "location", header: "Location", cell: ({ row }) => row.original.location ?? "-" },
    ...(admin ? [{ id: "actions", header: () => <span className="sr-only">Actions</span>, cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="icon-sm" aria-label={`Edit ${row.original.title}`} onClick={() => setEditing(row.original)}><Pencil /></Button>
        <Button variant="ghost" size="icon-sm" aria-label={`Delete ${row.original.title}`} onClick={() => setDeleting(row.original)}><Trash2 /></Button>
      </div>) } as ColumnDef<Ev, unknown>] : []),
  ]
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <ReportFilterBar show={["branch", "year"]} />
        {admin && <Button onClick={() => setEditing("new")}><Plus /> New event</Button>}
      </div>
      <ServerDataTable columns={columns} rows={q.data as Ev[] | undefined} isLoading={q.isPending} error={q.isError ? parseApiError(q.error).message : null} onRetry={() => q.refetch()} emptyMessage="No calendar events." />
      {editing && <EventDialog key={editing === "new" ? "new" : editing.id} ev={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title="Delete event?" description={deleting ? `This permanently deletes "${deleting.title}". This is recorded in the audit log.` : ""} confirmLabel="Delete" destructive isPending={del.isPending} onConfirm={() => deleting && del.mutate(deleting)} />
    </div>
  )
}

function Holidays() {
  const { values: f } = useReportFilters()
  const q = useCalendarHolidays({ grade_id: f.grade_id, from: f.date_from, to: f.date_to })
  const columns: ColumnDef<NonNullable<typeof q.data>[number], unknown>[] = [{ accessorKey: "date", header: "Date" }, { accessorKey: "remark", header: "Remark" }]
  return (
    <div className="space-y-4">
      <ReportFilterBar show={["branch", "grade", "dates"]} />
      <p className="text-sm text-muted-foreground">Holiday school days per grade (set under <Link className="underline" href="/attendance/school-days">School days</Link>). Branch-level holiday records live on the <Link className="underline" href="/holidays">Holidays</Link> page.</p>
      <ServerDataTable columns={columns} rows={q.data} isLoading={q.isPending} error={q.isError ? parseApiError(q.error).message : null} onRetry={() => q.refetch()} emptyMessage="No holidays for this filter." />
    </div>
  )
}

export default function SchoolCalendarPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">School calendar</h1>
      <Suspense>
        <Tabs defaultValue="events">
          <TabsList><TabsTrigger value="events">Events</TabsTrigger><TabsTrigger value="holidays">Holidays</TabsTrigger></TabsList>
          <TabsContent value="events"><Events /></TabsContent>
          <TabsContent value="holidays"><Holidays /></TabsContent>
        </Tabs>
      </Suspense>
    </div>
  )
}
