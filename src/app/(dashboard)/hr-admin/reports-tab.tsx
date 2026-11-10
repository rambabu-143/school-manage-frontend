"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { Field, OptionSelect, StaffChecklist } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AVAILED_REPORTS, RANGE_REPORTS, useRunReport } from "@/hooks/use-hr-admin"
import { validRange } from "@/lib/hr/rows"

const ALL = { ...Object.fromEntries(Object.entries(RANGE_REPORTS).map(([k, v]) => [k, { label: v.label, kind: "range" as const }])), ...Object.fromEntries(Object.entries(AVAILED_REPORTS).map(([k, v]) => [k, { label: v.label, kind: "availed" as const }])) }

export function ReportsTab() {
  const [kind, setKind] = React.useState<string>("generate")
  const [ids, setIds] = React.useState<string[]>([])
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [year, setYear] = React.useState<string>()
  const [sm, setSm] = React.useState("1")
  const [em, setEm] = React.useState("12")
  const run = useRunReport()
  const meta = ALL[kind]
  const ready = ids.length > 0 && (meta.kind === "range" ? validRange(from, to) : !!year && Number(sm) >= 1 && Number(em) <= 12 && Number(sm) <= Number(em))

  function go() {
    if (!ready) return
    if (meta.kind === "range") run.mutate(() => RANGE_REPORTS[kind as keyof typeof RANGE_REPORTS].run({ staff_ids: ids, from_date: from, to_date: to }))
    else run.mutate(() => AVAILED_REPORTS[kind as keyof typeof AVAILED_REPORTS].run({ staff_ids: ids, academic_year_id: year!, start_month: Number(sm), end_month: Number(em) }))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Report"><OptionSelect label="Report" placeholder="Select" value={kind} onChange={(v) => { setKind(v); run.reset() }} options={Object.entries(ALL).map(([value, m]) => ({ value, label: m.label }))} /></Field>
        {meta.kind === "range" ? (<>
          <Field label="From"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="To"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        </>) : (<>
          <Field label="Academic year"><AcademicYearSelect value={year} onChange={setYear} /></Field>
          <Field label="From month (1-12)"><Input type="number" min={1} max={12} value={sm} onChange={(e) => setSm(e.target.value)} /></Field>
          <Field label="To month (1-12)"><Input type="number" min={1} max={12} value={em} onChange={(e) => setEm(e.target.value)} /></Field>
        </>)}
      </div>
      {meta.kind === "range" && from && to && !validRange(from, to) && <p role="alert" className="text-sm text-destructive">To date must not be before from date.</p>}
      <StaffChecklist value={ids} onChange={setIds} />
      <div><Button disabled={!ready || run.isPending} onClick={go}>{run.isPending ? "Running..." : "Run report"}</Button></div>
      {(run.isPending || run.isError || run.data) && (
        <RowsTable rows={run.data} isLoading={run.isPending} error={run.error} onRetry={go} empty="No records for these filters." />
      )}
    </div>
  )
}
