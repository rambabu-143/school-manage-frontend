"use client"

import { Suspense, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ReportFilterBar, useReportFilters } from "@/components/shared/report-filter-bar"
import { ServerDataTable } from "@/components/shared/server-data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchoolDays, useSave, useTerms, useTermAttendance } from "@/hooks/use-attendance-admin"
import { useSession } from "@/hooks/use-session"
import { api } from "@/lib/typed-api"
import { parseApiError } from "@/lib/shared/api-error"
import { ADMIN_ROLES } from "@/types/auth"

const err = (q: { isError: boolean; error: unknown }) => (q.isError ? parseApiError(q.error).message : null)

function SchoolDays() {
  const { values: f } = useReportFilters()
  const { data: user } = useSession()
  const canEdit = !!user && ADMIN_ROLES.includes(user.role)
  const q = useSchoolDays({ grade_id: f.grade_id, date_from: f.date_from, date_to: f.date_to })
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [status, setStatus] = useState<"WORKING" | "HOLIDAY">("HOLIDAY")
  const [remark, setRemark] = useState("")
  const set = useSave("school-days", () => api("post", "/attendance/school-days", { body: { grade_id: f.grade_id!, start_date: from, end_date: to, status, remark } }), "School days updated")
  const columns: ColumnDef<NonNullable<typeof q.data>[number], unknown>[] = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "remark", header: "Remark" },
    { accessorKey: "term", header: "Term", cell: ({ row }) => row.original.term ?? "-" },
  ]
  return (
    <div className="space-y-4">
      <ReportFilterBar show={["branch", "grade", "dates"]} />
      {!f.grade_id || !f.date_from || !f.date_to ? <p className="text-sm text-muted-foreground">Pick a grade and a date range to list school days.</p> : null}
      <ServerDataTable columns={columns} rows={q.data} isLoading={q.isFetching && !q.data} error={err(q)} onRetry={() => q.refetch()} emptyMessage="No school days in this range." />
      {canEdit && (
        <form className="flex flex-wrap items-end gap-3 rounded-lg border p-3" onSubmit={(e) => { e.preventDefault(); set.mutate(undefined) }}>
          <div className="space-y-1"><Label htmlFor="sd-from">From</Label><Input id="sd-from" type="date" required value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="space-y-1"><Label htmlFor="sd-to">To</Label><Input id="sd-to" type="date" required min={from} value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <div className="space-y-1">
            <Label htmlFor="sd-status">Mark as</Label>
            <select id="sd-status" className="h-9 rounded-md border bg-background px-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value as "WORKING" | "HOLIDAY")}>
              <option value="HOLIDAY">Holiday</option><option value="WORKING">Working</option>
            </select>
          </div>
          <div className="space-y-1"><Label htmlFor="sd-remark">Remark</Label><Input id="sd-remark" value={remark} onChange={(e) => setRemark(e.target.value)} /></div>
          <Button type="submit" disabled={!f.grade_id || set.isPending}>{set.isPending ? "Saving..." : "Apply to selected grade"}</Button>
        </form>
      )}
    </div>
  )
}

function Terms() {
  const { values: f } = useReportFilters()
  const { data: user } = useSession()
  const canEdit = !!user && ADMIN_ROLES.includes(user.role)
  const q = useTerms(f.academic_year_id)
  const [n, setN] = useState("1")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const create = useSave("attendance-terms", () => api("post", "/attendance/terms", { body: { academic_year_id: f.academic_year_id!, term_session: Number(n), start_date: from, end_date: to } }), "Term created")
  const [term, setTerm] = useState("1")
  const ta = useTermAttendance(f.section_id, Number(term))
  const columns: ColumnDef<NonNullable<typeof q.data>[number], unknown>[] = [
    { accessorKey: "term_session", header: "Term" }, { accessorKey: "start_date", header: "Start" }, { accessorKey: "end_date", header: "End" },
  ]
  return (
    <div className="space-y-4">
      <ReportFilterBar show={["year", "grade", "section"]} />
      {!f.academic_year_id && <p className="text-sm text-muted-foreground">Pick an academic year to list terms.</p>}
      <ServerDataTable columns={columns} rows={q.data} isLoading={q.isFetching && !q.data} error={err(q)} onRetry={() => q.refetch()} emptyMessage="No terms defined." />
      {canEdit && (
        <form className="flex flex-wrap items-end gap-3 rounded-lg border p-3" onSubmit={(e) => { e.preventDefault(); create.mutate(undefined) }}>
          <div className="space-y-1"><Label htmlFor="t-n">Term no.</Label><Input id="t-n" type="number" min={1} required value={n} onChange={(e) => setN(e.target.value)} className="w-24" /></div>
          <div className="space-y-1"><Label htmlFor="t-from">Start</Label><Input id="t-from" type="date" required value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="space-y-1"><Label htmlFor="t-to">End</Label><Input id="t-to" type="date" required min={from} value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <Button type="submit" disabled={!f.academic_year_id || create.isPending}>{create.isPending ? "Saving..." : "Add term"}</Button>
        </form>
      )}
      <section aria-label="Term attendance" className="space-y-2">
        <div className="flex items-end gap-3">
          <h2 className="text-base font-medium">Term attendance</h2>
          <div className="space-y-1"><Label htmlFor="ta-term">Term</Label><Input id="ta-term" type="number" min={1} value={term} onChange={(e) => setTerm(e.target.value)} className="w-24" /></div>
        </div>
        {!f.section_id ? <p className="text-sm text-muted-foreground">Pick a section.</p>
          : ta.isPending ? <p className="text-sm text-muted-foreground">Loading...</p>
          : ta.isError ? <p role="alert" className="text-sm text-destructive">{parseApiError(ta.error).message}</p>
          : <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">{JSON.stringify(ta.data, null, 2)}</pre>}
      </section>
    </div>
  )
}

export default function SchoolDaysPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">School days and terms</h1>
        <p className="text-sm text-muted-foreground">Working/holiday days per grade, and academic terms.</p>
      </div>
      <Suspense>
        <Tabs defaultValue="days">
          <TabsList><TabsTrigger value="days">School days</TabsTrigger><TabsTrigger value="terms">Terms</TabsTrigger></TabsList>
          <TabsContent value="days"><SchoolDays /></TabsContent>
          <TabsContent value="terms"><Terms /></TabsContent>
        </Tabs>
      </Suspense>
    </div>
  )
}
