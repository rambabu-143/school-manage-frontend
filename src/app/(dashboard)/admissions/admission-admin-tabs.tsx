"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import { ReportFilterBar, useReportFilters } from "@/components/shared/report-filter-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { errorMessage } from "@/lib/error-message"
import { qk } from "@/lib/query-keys"
import { api } from "@/lib/typed-api"

type Row = Record<string, unknown>

function RowsTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Nothing to show for these filters.</p>
  const cols = Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== "object").slice(0, 8)
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead><tr className="text-left">{cols.map((c) => <th key={c} className="p-2">{c.replace(/_/g, " ")}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">{cols.map((c) => <td key={c} className="p-2">{String(r[c] ?? "")}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Result({ q }: { q: { isPending: boolean; isError: boolean; error: unknown; data?: unknown; fetchStatus: string } }) {
  if (q.fetchStatus === "idle" && q.isPending) return <p className="text-sm text-muted-foreground">Select a branch and academic year.</p>
  if (q.isPending) return <Skeleton className="h-32 w-full" />
  if (q.isError) return <p role="alert" className="text-sm text-destructive">{errorMessage(q.error)}</p>
  return <RowsTable rows={(Array.isArray(q.data) ? q.data : q.data ? [q.data] : []) as Row[]} />
}

function Panel() {
  const { values } = useReportFilters()
  const query = { branch_id: values.branch_id ?? "", academic_year_id: values.academic_year_id ?? "" }
  const enabled = !!values.branch_id && !!values.academic_year_id
  const [cls, setCls] = React.useState("")
  const [phase, setPhase] = React.useState("1")

  const regs = useQuery({ queryKey: qk("admission-registrations", query), enabled, queryFn: () => api("get", "/admission/online-registration", { query }) })
  const sibs = useQuery({ queryKey: qk("admission-siblings", query), enabled, queryFn: () => api("get", "/admission/sibling-detail/all-forms", { query }) })
  const tally = useQuery({ queryKey: qk("admission-tally", query), enabled, queryFn: () => api("get", "/admission/tally-report/files", { query }) })
  const setting = useQuery({ queryKey: qk("admission-setting", query), enabled, queryFn: () => api("get", "/admission-settings", { query }), retry: false })
  const [run, setRun] = React.useState<{ cls: string; phase: number } | null>(null)
  const final = useQuery({
    queryKey: qk("admission-reports", "final-result", query, run),
    enabled: enabled && !!run,
    queryFn: () => api("post", "/admission/report/final-result", { query, body: { class: run!.cls, phase: run!.phase, gender: "ALL", category: "ALL", selected_status: "ALL" } }),
  })

  return (
    <div className="space-y-3">
      <ReportFilterBar show={["branch", "year"]} />
      <Tabs defaultValue="registrations">
        <TabsList className="flex-wrap">
          <TabsTrigger value="registrations">Online registrations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="siblings">Sibling checks</TabsTrigger>
          <TabsTrigger value="results">Final result</TabsTrigger>
          <TabsTrigger value="tally">Tally imports</TabsTrigger>
        </TabsList>
        <TabsContent value="registrations"><Result q={regs} /></TabsContent>
        <TabsContent value="settings"><Result q={setting} /></TabsContent>
        <TabsContent value="siblings"><Result q={sibs} /></TabsContent>
        <TabsContent value="tally"><Result q={tally} /></TabsContent>
        <TabsContent value="results" className="space-y-3">
          <form
            className="flex items-end gap-3"
            onSubmit={(e) => { e.preventDefault(); if (cls.trim()) setRun({ cls: cls.trim(), phase: Number(phase) || 1 }) }}
          >
            <div className="space-y-1"><Label htmlFor="adm-class">Class</Label><Input id="adm-class" value={cls} onChange={(e) => setCls(e.target.value)} className="w-32" /></div>
            <div className="space-y-1"><Label htmlFor="adm-phase">Phase</Label><Input id="adm-phase" type="number" min={1} value={phase} onChange={(e) => setPhase(e.target.value)} className="w-24" /></div>
            <Button type="submit" disabled={!cls.trim() || !enabled}>Run report</Button>
          </form>
          {run && <Result q={final} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function AdmissionAdminTabs() {
  return (
    <React.Suspense fallback={<Skeleton className="h-32 w-full" />}>
      <Panel />
    </React.Suspense>
  )
}
