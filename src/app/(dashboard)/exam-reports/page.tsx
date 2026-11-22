"use client"

import { useState } from "react"

import { Pick, useSectionOptions, useSubjectOptions, useYearOptions } from "@/app/(dashboard)/exam-records/pickers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useApproveBluesheet, useExamReport } from "@/hooks/use-exam-reports"
import { buildApprove, buildReportRequest, cell, toTable, type ReportKind } from "@/lib/exam-reports"
import { parseApiError } from "@/lib/shared/api-error"

const KINDS: { value: ReportKind; label: string }[] = [
  { value: "junior-bluesheet", label: "Junior bluesheet" },
  { value: "junior-subject-bluesheet", label: "Subject bluesheet" },
  { value: "senior-bluesheet", label: "Senior bluesheet" },
  { value: "senior-exam-bluesheet", label: "Senior exam bluesheet" },
  { value: "ar", label: "Assessment record" },
  { value: "ar-sections", label: "Junior AR sections" },
]
const TERMS = ["1", "2", "3"].map((t) => ({ value: t, label: `Term ${t}` }))
const WINGS = [{ value: "junior", label: "Junior" }, { value: "senior", label: "Senior" }]

export default function ExamReportsPage() {
  const sections = useSectionOptions()
  const subjects = useSubjectOptions()
  const years = useYearOptions()
  const [kind, setKind] = useState<ReportKind>("junior-bluesheet")
  const [wing, setWing] = useState("junior")
  const [sectionId, setSectionId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [yearId, setYearId] = useState("")
  const [examId, setExamId] = useState("")
  const [term, setTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [tillCurrent, setTillCurrent] = useState(false)

  const input = { wing, sectionId, subjectId, yearId, examId: examId.trim(), term, startDate, endDate, tillCurrent }
  const req = buildReportRequest(kind, input)
  const q = useExamReport(req)
  const approve = useApproveBluesheet()
  const approveReq = kind === "junior-bluesheet" ? buildApprove("bluesheet", input) : kind === "junior-subject-bluesheet" && wing === "junior" ? buildApprove("subject-bluesheet", input) : null
  const table = q.data === undefined ? null : toTable(q.data)
  const needs = (k: ReportKind[]) => k.includes(kind)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Exam Reports</h1>
        <p className="text-sm text-muted-foreground">Bluesheets and assessment records. Downloads and QR data live under Exams &amp; Records.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <Pick label="Report" value={kind} onChange={(v) => v && setKind(v as ReportKind)} options={KINDS} />
        {needs(["junior-subject-bluesheet", "ar"]) && <Pick label="Wing" value={wing} onChange={(v) => setWing(v || "junior")} options={WINGS} />}
        {needs(["ar-sections"]) ? (
          <Pick label="Academic year" value={yearId} onChange={setYearId} options={years.options} loading={years.isPending} />
        ) : (
          <Pick label="Section" value={sectionId} onChange={setSectionId} options={sections.options} loading={sections.isPending} />
        )}
        {needs(["junior-subject-bluesheet"]) && <Pick label="Subject" value={subjectId} onChange={setSubjectId} options={subjects.options} loading={subjects.isPending} />}
        {needs(["junior-bluesheet", "junior-subject-bluesheet", "ar", "ar-sections"]) && <Pick label="Term" value={term} onChange={setTerm} options={TERMS} />}
        {needs(["senior-exam-bluesheet"]) && (
          <div className="flex flex-col gap-1"><Label htmlFor="er-exam">Exam ID</Label><Input id="er-exam" value={examId} onChange={(e) => setExamId(e.target.value)} /></div>
        )}
        {needs(["ar"]) && (
          <>
            <div className="flex flex-col gap-1"><Label htmlFor="er-start">From</Label><Input id="er-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div className="flex flex-col gap-1"><Label htmlFor="er-end">To</Label><Input id="er-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
            <label className="flex items-center gap-1 pb-2 text-sm"><input type="checkbox" checked={tillCurrent} onChange={(e) => setTillCurrent(e.target.checked)} />Till current date</label>
          </>
        )}
        {approveReq && (
          <Button variant="outline" disabled={approve.isPending} onClick={() => approve.mutate(approveReq)}>Approve</Button>
        )}
      </div>

      {!req && <p className="text-sm text-muted-foreground">Fill in the filters to load the report.</p>}
      {req && q.isFetching && <p role="status" className="text-sm text-muted-foreground">Loading...</p>}
      {q.isError && <p role="alert" className="text-sm text-destructive">{parseApiError(q.error).message}</p>}
      {table && (
        <div className="space-y-3">
          {table.meta.length > 0 && (
            <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {table.meta.map(([k, v]) => <div key={k} className="flex gap-1"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}
            </dl>
          )}
          {table.rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rows returned.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader><TableRow>{table.columns.map((c) => <TableHead key={c}>{c}</TableHead>)}</TableRow></TableHeader>
                <TableBody>
                  {table.rows.map((r, i) => <TableRow key={i}>{table.columns.map((c) => <TableCell key={c}>{cell(r[c])}</TableCell>)}</TableRow>)}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
