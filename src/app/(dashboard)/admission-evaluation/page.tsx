"use client"

import * as React from "react"

import { ReportFilterBar, useReportFilters } from "@/components/shared/report-filter-bar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGrades } from "@/hooks/use-grades"

import { AttendanceTab } from "./attendance-tab"
import { MarksTab } from "./marks-tab"
import { ResultsTab } from "./results-tab"
import { RoomsTab } from "./rooms-tab"
import type { EvalCtx } from "./shared"

function Panel() {
  const { values } = useReportFilters()
  const grades = useGrades(values.branch_id)
  const [phase, setPhase] = React.useState("1")
  const className = grades.data?.find((g) => g.id === values.grade_id)?.name
  const ctx: EvalCtx = { scope: { branchId: values.branch_id, yearId: values.academic_year_id }, gradeId: values.grade_id, className, phase: Number(phase) }
  // Tabs are keyed by scope so unsaved marks drafts never leak across branch/year/class/phase.
  const key = [values.branch_id, values.academic_year_id, values.grade_id, phase].join("|")

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <ReportFilterBar show={["branch", "year", "grade"]} />
        <div className="space-y-1"><Label htmlFor="eval-phase">Phase</Label><Input id="eval-phase" type="number" min={1} step={1} value={phase} onChange={(e) => setPhase(e.target.value)} className="w-24" /></div>
      </div>
      <Tabs defaultValue="marks" key={key}>
        <TabsList>
          <TabsTrigger value="marks">Marks entry</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="rooms">Room allocation</TabsTrigger>
          <TabsTrigger value="results">Evaluation grid</TabsTrigger>
        </TabsList>
        <TabsContent value="marks"><MarksTab ctx={ctx} /></TabsContent>
        <TabsContent value="attendance"><AttendanceTab ctx={ctx} /></TabsContent>
        <TabsContent value="rooms"><RoomsTab ctx={ctx} /></TabsContent>
        <TabsContent value="results"><ResultsTab ctx={ctx} /></TabsContent>
      </Tabs>
    </div>
  )
}

export default function AdmissionEvaluationPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Admission evaluation</h1>
        <p className="text-sm text-muted-foreground">Entrance attendance, marks entry, room allocation and results for one class and phase.</p>
      </div>
      <React.Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <Panel />
      </React.Suspense>
    </div>
  )
}
