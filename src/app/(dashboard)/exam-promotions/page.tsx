"use client"

import { useState } from "react"

import { Pick, useSectionOptions } from "@/app/(dashboard)/exam-records/pickers"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChangeSectionMarks, usePromotion, useSavePromotion, useStudentMarks, useTransferMarks } from "@/hooks/use-exam-promotions"
import { buildPromotionSave, buildSectionChange, buildTransfer, promotionChanges, toMarkRows, toPromotionRows, type MarkRow, type PromotionRow } from "@/lib/exam-promotions"
import { parseApiError } from "@/lib/shared/api-error"

const Err = ({ e }: { e: unknown }) => (e ? <p role="alert" className="text-sm text-destructive">{parseApiError(e).message}</p> : null)

function PromotionTab() {
  const sections = useSectionOptions()
  const [sectionId, setSectionId] = useState("")
  const [dateEdit, setDateEdit] = useState<string | null>(null)
  const [edits, setEdits] = useState<PromotionRow[] | null>(null)
  const [confirming, setConfirming] = useState(false)
  const q = usePromotion(sectionId)
  const save = useSavePromotion(sectionId)
  const saved = toPromotionRows(q.data)
  const savedDate = (q.data as { session_begins?: string } | undefined)?.session_begins ?? ""

  const rows = edits ?? saved
  const date = dateEdit ?? savedDate
  const set = (i: number, p: Partial<PromotionRow>) => setEdits((r) => (r ?? saved).map((x, j) => (j === i ? { ...x, ...p } : x)))
  const built = buildPromotionSave(date, rows)
  const changed = promotionChanges(saved, rows)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Pick label="Section" value={sectionId} onChange={(v) => { setSectionId(v); setEdits(null); setDateEdit(null) }} options={sections.options} loading={sections.isPending} />
        <div className="flex flex-col gap-1"><Label htmlFor="ep-date">Session begins</Label><Input id="ep-date" type="date" value={date} onChange={(e) => setDateEdit(e.target.value)} /></div>
      </div>
      {q.isError && <Err e={q.error} />}
      {rows.length > 0 && (
        <>
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Promoted to</TableHead><TableHead>Essential repeat</TableHead><TableHead>Provisional</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={r.studentId}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>
                    <select aria-label={`Promoted to for ${r.name}`} value={r.promotedTo} onChange={(e) => set(i, { promotedTo: e.target.value })} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
                      <option value="">Not promoted</option>
                      {sections.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </TableCell>
                  <TableCell><input type="checkbox" aria-label={`Essential repeat ${r.name}`} checked={r.essentialRepeat} onChange={(e) => set(i, { essentialRepeat: e.target.checked })} /></TableCell>
                  <TableCell><input type="checkbox" aria-label={`Provisional ${r.name}`} checked={r.provisional} onChange={(e) => set(i, { provisional: e.target.checked })} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {built.error && <p className="text-sm text-muted-foreground">{built.error}</p>}
          <div><Button disabled={built.error !== undefined || save.isPending} onClick={() => setConfirming(true)}>Review and save</Button></div>
        </>
      )}
      <ConfirmDialog
        open={confirming} onOpenChange={setConfirming} title="Overwrite promotion decisions?" confirmLabel="Save decisions" isPending={save.isPending}
        description={`This replaces the saved decisions for all ${rows.length} students in this section (${changed.length} changed${changed.length ? `: ${changed.slice(0, 5).map((c) => c.name).join(", ")}${changed.length > 5 ? ", ..." : ""}` : ""}). Session begins ${date}.`}
        onConfirm={() => { if (built.value) save.mutate(built.value, { onSuccess: () => { setEdits(null); setDateEdit(null) }, onSettled: () => setConfirming(false) }) }}
      />
      <Err e={save.error} />
    </div>
  )
}

function MarksTab({ mode }: { mode: "transfer" | "change" }) {
  const sections = useSectionOptions()
  const [adm, setAdm] = useState("")
  const [lookup, setLookup] = useState("")
  const [toId, setToId] = useState("")
  const [fromId, setFromId] = useState("")
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [confirming, setConfirming] = useState(false)
  const q = useStudentMarks(lookup, toId, fromId)
  const transfer = useTransferMarks()
  const change = useChangeSectionMarks()
  const run = mode === "transfer" ? transfer : change
  const student = q.data?.student
  const prev = q.data ? toMarkRows(q.data.previous_subjects) : []

  const marks: MarkRow[] = prev.map((r) => ({ ...r, marks: edits[r.subExamId] ?? r.marks }))

  const built = mode === "transfer" ? buildTransfer(student?.student_id ?? "", toId, marks) : buildSectionChange(student?.student_id ?? "", fromId, toId)
  const count = mode === "transfer" ? marks.filter((m) => m.marks.trim()).length : prev.filter((m) => m.marks).length
  const submit = () => {
    if (!built.value) return
    const v = built.value as { body: unknown; params: Record<string, string> }
    run.mutate({ body: v.body, params: v.params }, { onSettled: () => setConfirming(false) })
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {mode === "transfer"
          ? "Writes the marks below into the student's current section, flagged as transferred. Existing marks for those sub-exams are overwritten."
          : "Copies the student's marks from every sub-exam of the old section into the same-named sub-exam of the new section. Existing marks there are overwritten. Needs a combo assigned to the student."}
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1"><Label htmlFor={`adm-${mode}`}>Admission no</Label><Input id={`adm-${mode}`} value={adm} onChange={(e) => setAdm(e.target.value)} /></div>
        <Pick label={mode === "transfer" ? "Current section" : "New section"} value={toId} onChange={setToId} options={sections.options} loading={sections.isPending} />
        <Pick label={mode === "transfer" ? "Previous section" : "Old section"} value={fromId} onChange={setFromId} options={sections.options} loading={sections.isPending} />
        <Button variant="outline" disabled={!adm.trim() || !toId} onClick={() => { setEdits({}); setLookup(adm.trim()) }}>Look up</Button>
      </div>
      {q.isError && <Err e={q.error} />}
      {student && <p className="text-sm">{student.name} ({student.admission_number}) into {q.data?.section.name}</p>}
      {student && mode === "transfer" && (
        <Table>
          <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Exam</TableHead><TableHead>Sub-exam</TableHead><TableHead>Marks to write</TableHead></TableRow></TableHeader>
          <TableBody>
            {marks.map((m) => (
              <TableRow key={m.subExamId}>
                <TableCell>{m.subject}</TableCell><TableCell>{m.exam}</TableCell><TableCell>{m.subExam}</TableCell>
                <TableCell><Input aria-label={`Marks for ${m.subject} ${m.subExam}`} className="w-24" value={m.marks} onChange={(e) => setEdits((x) => ({ ...x, [m.subExamId]: e.target.value }))} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {student && mode === "change" && <p className="text-sm">{count} recorded mark(s) found in the old section.</p>}
      {student && built.error && <p className="text-sm text-muted-foreground">{built.error}</p>}
      {student && <div><Button disabled={built.error !== undefined || run.isPending} onClick={() => setConfirming(true)}>{mode === "transfer" ? "Review and transfer" : "Review and move"}</Button></div>}
      <ConfirmDialog
        open={confirming} onOpenChange={setConfirming} destructive isPending={run.isPending}
        title={mode === "transfer" ? "Transfer marks?" : "Move marks to the new section?"} confirmLabel={mode === "transfer" ? "Transfer" : "Move marks"}
        description={`${mode === "transfer" ? `Writes ${count} mark(s) for` : "Overwrites matching marks in the new section for"} ${student?.name ?? ""} (${student?.admission_number ?? ""}). This cannot be undone from here.`}
        onConfirm={submit}
      />
      <Err e={run.error} />
    </div>
  )
}

export default function ExamPromotionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Exam Promotions</h1>
        <p className="text-sm text-muted-foreground">Promotion decisions per section, and senior marks transfer or change of section. Each action asks for confirmation; the server is the final authority.</p>
      </div>
      <Tabs defaultValue="promotion">
        <TabsList>
          <TabsTrigger value="promotion">Promotion decisions</TabsTrigger>
          <TabsTrigger value="transfer">Transfer marks</TabsTrigger>
          <TabsTrigger value="change">Change section</TabsTrigger>
        </TabsList>
        <TabsContent value="promotion"><PromotionTab /></TabsContent>
        <TabsContent value="transfer"><MarksTab mode="transfer" /></TabsContent>
        <TabsContent value="change"><MarksTab mode="change" /></TabsContent>
      </Tabs>
    </div>
  )
}
