"use client"

import * as React from "react"

import { AppraisalCycleSelect } from "@/components/appraisal-cycle-select"
import { Field, OptionSelect, staffName } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { StaffSelect } from "@/components/staff-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAarForm, useAarReport, useAssessorForms, useSaveAarForm, useValidateRatings, useValidateStaffRatings } from "@/hooks/use-staff-aar"
import { useSession } from "@/hooks/use-session"
import { useStaff } from "@/hooks/use-staff"
import { cellText, humanize, isCountsOnly, parseJsonObject, sectionProgress, type Row } from "@/lib/hr/rows"
import { parseApiError } from "@/lib/shared/api-error"
import { ADMIN_ROLES } from "@/types/auth"

export default function StaffAarPage() {
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)
  const staff = useStaff()
  const own = staff.data?.find((s) => s.user_id === user?.id)?.id
  const [cycle, setCycle] = React.useState<string>()
  const [picked, setPicked] = React.useState<string>()
  const target = isAdmin ? picked : own
  const isSelf = !!target && target === own

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Staff AAR</h1>
        <p className="text-sm text-muted-foreground">Appraisal forms and student/staff rating validation.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Field label="Appraisal cycle"><AppraisalCycleSelect value={cycle} onChange={setCycle} /></Field>
        {isAdmin && <Field label="Staff member"><StaffSelect value={picked} onChange={setPicked} /></Field>}
      </div>
      {!isAdmin && !own && !staff.isPending && <p role="alert" className="text-sm text-destructive">No staff profile is linked to your account.</p>}
      {!cycle || !target ? <p className="text-sm text-muted-foreground">Select a cycle{isAdmin ? " and a staff member" : ""}.</p> : (
        <Tabs defaultValue="form">
          <TabsList>
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="assessor">As assessor</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>
          <TabsContent value="form"><FormPanel staffId={target} cycleId={cycle} isSelf={isSelf} /></TabsContent>
          <TabsContent value="assessor"><AssessorPanel cycleId={cycle} /></TabsContent>
          <TabsContent value="ratings"><RatingsPanel staffId={target} cycleId={cycle} isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="report"><ReportPanel staffId={target} cycleId={cycle} isSelf={isSelf} /></TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function FormPanel({ staffId, cycleId, isSelf }: { staffId: string; cycleId: string; isSelf: boolean }) {
  const q = useAarForm(staffId, cycleId)
  if (q.isPending) return <p className="text-sm text-muted-foreground">Loading form...</p>
  if (q.isError) return <p role="alert" className="text-sm text-destructive">{parseApiError(q.error).message}</p>
  // key remounts the editor with fresh initial state whenever the loaded form changes
  return <FormEditor key={`${q.data.form?.id}:${q.dataUpdatedAt}`} data={q.data} staffId={staffId} cycleId={cycleId} isSelf={isSelf} />
}

function FormEditor({ data, staffId, cycleId, isSelf }: { data: NonNullable<ReturnType<typeof useAarForm>["data"]>; staffId: string; cycleId: string; isSelf: boolean }) {
  const save = useSaveAarForm()
  const form = data.form
  const [text, setText] = React.useState(form?.self_assessment ? JSON.stringify(form.self_assessment, null, 2) : "")
  const [submit, setSubmit] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const locked = !!form?.is_submit

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      const self_assessment = parseJsonObject(text)
      setErr(null)
      save.mutate({ form_id: form?.id, body: { cycle_id: cycleId, staff_id: staffId, self_assessment, is_submit: submit } })
    } catch {
      setErr("Self assessment must be a valid JSON object.")
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={onSave}>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{data.staff.name}</span>
        <span className="text-muted-foreground">{data.staff.designation}</span>
        <Badge variant={locked ? "default" : "secondary"}>{locked ? "Submitted" : form ? "Draft" : "Not started"}</Badge>
      </div>
      {data.assignments.length > 0 && <p className="text-sm text-muted-foreground">Assessors: {data.assignments.map((a) => `${a.assessor_name} (${a.role})`).join(", ")}</p>}
      <Field label={isSelf ? "My self assessment (JSON object)" : "Self assessment (JSON object)"}>
        <Textarea rows={10} className="font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} disabled={locked} aria-invalid={!!err} />
      </Field>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <label className="flex items-center gap-2 text-sm"><Checkbox checked={submit} disabled={locked} onCheckedChange={(c) => setSubmit(!!c)} /> Submit final (cannot be edited afterwards)</label>
      <div><Button type="submit" disabled={locked || save.isPending}>{save.isPending ? "Saving..." : "Save form"}</Button></div>
    </form>
  )
}

function AssessorPanel({ cycleId }: { cycleId: string }) {
  const q = useAssessorForms(cycleId)
  return (
    <RowsTable rows={q.data} isLoading={q.isPending} error={q.error} onRetry={() => q.refetch()} empty="You are not an assessor in this cycle."
      columns={[
        { id: "s", header: "Staff", cell: ({ row }) => row.original.staff.name },
        { accessorKey: "role", header: "Role" },
        { id: "f", header: "Form", cell: ({ row }) => (row.original.form ? (row.original.form.is_submit ? "Submitted" : "Draft") : "Not started") },
      ]} />
  )
}

function RatingsPanel({ staffId, cycleId, isAdmin }: { staffId: string; cycleId: string; isAdmin: boolean }) {
  const q = useValidateRatings(staffId, cycleId)
  const [bucket, setBucket] = React.useState<"VP" | "HOD" | "HM">("VP")
  const [load, setLoad] = React.useState(false)
  const staffRatings = useValidateStaffRatings(bucket, cycleId, load)
  const rows = (q.data ?? []) as unknown as Row[]
  const counts = isCountsOnly(rows)

  return (
    <div className="flex flex-col gap-4">
      {counts && <p className="rounded-md border bg-muted p-3 text-sm" role="note">Ratings are anonymous: you can only see how many students have rated per section.</p>}
      <RowsTable rows={q.data as Row[] | undefined} isLoading={q.isPending} error={q.error} onRetry={() => q.refetch()} empty="No sections to validate."
        columns={counts ? [
          { id: "sec", header: "Section", cell: ({ row }) => `${row.original.grade_name} ${row.original.section_name}` },
          { id: "p", header: "Progress", cell: ({ row }) => sectionProgress(row.original as never) },
        ] : undefined} />
      {isAdmin && (
        <section className="flex flex-col gap-3">
          <h2 className="font-medium">Staff-given ratings</h2>
          <div className="flex items-end gap-3">
            <Field label="Rated role"><OptionSelect label="Rated role" placeholder="Select" value={bucket} onChange={(v) => { setBucket(v as never); setLoad(false) }} options={["VP", "HOD", "HM"].map((v) => ({ value: v, label: v }))} /></Field>
            <Button onClick={() => (load ? staffRatings.refetch() : setLoad(true))} disabled={staffRatings.isFetching}>Load</Button>
          </div>
          {load && <RowsTable rows={staffRatings.data} isLoading={staffRatings.isPending} error={staffRatings.error} onRetry={() => staffRatings.refetch()} empty="No ratings yet."
            columns={[
              { accessorKey: "staff_name", header: "Staff" }, { accessorKey: "rating_for", header: "For" },
              { id: "e", header: "Raters", cell: ({ row }) => `${row.original.entries.length}` },
            ]} />}
        </section>
      )}
    </div>
  )
}

function ReportPanel({ staffId, cycleId, isSelf }: { staffId: string; cycleId: string; isSelf: boolean }) {
  const [go, setGo] = React.useState(false)
  const q = useAarReport(staffId, cycleId, go)
  const staff = useStaff()
  const r = q.data
  const averages = Object.entries((r?.ratings.averages ?? {}) as Record<string, { average?: number; count?: number }>)
  return (
    <div className="flex flex-col gap-3">
      <div><Button onClick={() => (go ? q.refetch() : setGo(true))} disabled={q.isFetching}>{q.isFetching ? "Loading..." : "Generate report"}</Button></div>
      {isSelf && <p className="text-sm text-muted-foreground">Your report shows averages and counts only; individual students and comments are not shown.</p>}
      {q.isError && <p role="alert" className="text-sm text-destructive">{parseApiError(q.error).message}</p>}
      {r && (<>
        <p className="text-sm">Overall average: <strong>{cellText(r.ratings.overall_average)}</strong> {r.ratings.max_question && <span className="text-muted-foreground">(best: {r.ratings.max_question}; lowest: {r.ratings.min_question})</span>}</p>
        <RowsTable rows={averages.map(([question, v]) => ({ question, average: v.average, responses: v.count }))} empty="No ratings received." />
        <h2 className="font-medium">Classes taught</h2>
        <RowsTable rows={r.class_taught.map((c) => ({ class: `${c.grade_name} ${c.section_name}`, students: c.total_student }))} empty="None." />
        {!isSelf && Object.keys(r.ratings.comments ?? {}).length > 0 && (
          <section><h2 className="font-medium">Comments</h2>
            {Object.entries(r.ratings.comments as Record<string, string[]>).map(([qn, list]) => (
              <div key={qn} className="mt-2"><p className="text-sm font-medium">{humanize(qn)}</p><ul className="list-disc pl-5 text-sm">{list.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
            ))}
          </section>)}
        <p className="text-xs text-muted-foreground">Assessors: {r.assignments.map((a) => a.assessor_name || staffName(staff.data, a.assessor_staff_id)).join(", ") || "none"}</p>
      </>)}
    </div>
  )
}
