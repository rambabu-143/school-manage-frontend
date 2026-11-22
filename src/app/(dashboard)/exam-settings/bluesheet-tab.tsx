"use client"

import { useState } from "react"

import { Pick, useGradeOptions, useSubjectOptions, useYearOptions } from "@/app/(dashboard)/exam-records/pickers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDeleteSetting, useSaveSetting, useSettings } from "@/hooks/use-exam-settings"
import { buildBluesheetCreate, buildBluesheetUpdate, COLUMN_FOR, emptyPart, type BluesheetForm, type ColumnFor } from "@/lib/exam-settings"
import { parseApiError } from "@/lib/shared/api-error"

import { Check, DeleteConfirm, ExamChecks, FormDialog, SettingsTable, toggle } from "./shared"

interface Part { exam_name_ids: string[]; formula: string; weightage: number; compare_part: number | null }
interface Row {
  id: string; academic_year_id: string; grade_id: string; subject_id: string; column_name: string; column_for: string[]; term: string; max_marks: number
  formula: string; is_converted: boolean; converted_marks: number | null; description: Part[]; add_in_total: boolean; add_in_total_term1: boolean; order: number
}
const EMPTY: BluesheetForm = {
  yearId: "", gradeId: "", subjectId: "", columnName: "", columnFor: ["bluesheet"], term: "", maxMarks: "", formula: "no_formula",
  isConverted: false, convertedMarks: "", parts: [], addInTotal: false, addInTotalTerm1: false, order: "",
}

export function BluesheetSettingsTab() {
  const years = useYearOptions(), grades = useGradeOptions(), subjects = useSubjectOptions()
  const [flt, setFlt] = useState({ year: "", grade: "", subject: "" })
  const q = useSettings<Row>("bluesheet-settings", { academic_year_id: flt.year || undefined, grade_id: flt.grade || undefined, subject_id: flt.subject || undefined })
  const save = useSaveSetting("bluesheet-settings")
  const del = useDeleteSetting("bluesheet-settings")
  const [edit, setEdit] = useState<{ id?: string } | null>(null)
  const [f, setF] = useState(EMPTY)
  const [err, setErr] = useState<string>()
  const [rm, setRm] = useState<Row | null>(null)

  const open = (r?: Row) => {
    setF(r
      ? {
          yearId: r.academic_year_id, gradeId: r.grade_id, subjectId: r.subject_id, columnName: r.column_name,
          columnFor: r.column_for.filter((c): c is ColumnFor => (COLUMN_FOR as readonly string[]).includes(c)), term: r.term, maxMarks: String(r.max_marks),
          formula: r.formula, isConverted: r.is_converted, convertedMarks: r.converted_marks === null ? "" : String(r.converted_marks),
          parts: r.description.map((p) => ({ examIds: p.exam_name_ids, formula: p.formula, weightage: String(p.weightage), comparePart: p.compare_part === null ? "" : String(p.compare_part) })),
          addInTotal: r.add_in_total, addInTotalTerm1: r.add_in_total_term1, order: String(r.order),
        }
      : { ...EMPTY, yearId: flt.year, gradeId: flt.grade, subjectId: flt.subject })
    setErr(undefined)
    setEdit({ id: r?.id })
  }
  const submit = () => {
    const r = edit?.id ? buildBluesheetUpdate(f) : buildBluesheetCreate(f)
    if (r.error !== undefined) return setErr(r.error)
    save.mutate({ id: edit?.id, body: r.body }, { onSuccess: () => setEdit(null), onError: (e) => setErr(parseApiError(e).message) })
  }
  const text = (id: string, label: string, key: "columnName" | "term" | "maxMarks" | "formula" | "convertedMarks" | "order", props: React.ComponentProps<typeof Input> = {}) => (
    <div className="flex flex-col gap-1"><Label htmlFor={id}>{label}</Label><Input id={id} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} {...props} /></div>
  )
  const setPart = (i: number, patch: Partial<BluesheetForm["parts"][number]>) => setF({ ...f, parts: f.parts.map((p, j) => (j === i ? { ...p, ...patch } : p)) })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Pick label="Academic year" value={flt.year} onChange={(v) => setFlt({ ...flt, year: v })} options={years.options} loading={years.isPending} />
        <Pick label="Class" value={flt.grade} onChange={(v) => setFlt({ ...flt, grade: v })} options={grades.options} loading={grades.isPending} />
        <Pick label="Subject" value={flt.subject} onChange={(v) => setFlt({ ...flt, subject: v })} options={subjects.options} loading={subjects.isPending} />
        <Button onClick={() => open()}>New bluesheet column</Button>
      </div>
      <SettingsTable
        rows={q.data} loading={q.isPending} error={q.error} name={(r) => r.column_name} onEdit={open} onDelete={setRm}
        columns={[
          { header: "Order", cell: (r) => r.order },
          { header: "Column", cell: (r) => r.column_name },
          { header: "For", cell: (r) => r.column_for.join(", ") },
          { header: "Term", cell: (r) => r.term },
          { header: "Max", cell: (r) => (r.is_converted ? `${r.max_marks} -> ${r.converted_marks}` : r.max_marks) },
          { header: "Parts", cell: (r) => r.description.length },
        ]}
      />
      <FormDialog title={edit?.id ? "Edit bluesheet column" : "New bluesheet column"} open={!!edit} onClose={() => setEdit(null)} onSubmit={submit} pending={save.isPending} error={err}>
        {!edit?.id && (
          <>
            <Pick label="Academic year" value={f.yearId} onChange={(v) => setF({ ...f, yearId: v, parts: [] })} options={years.options} loading={years.isPending} />
            <Pick label="Class" value={f.gradeId} onChange={(v) => setF({ ...f, gradeId: v, parts: [] })} options={grades.options} loading={grades.isPending} />
            <Pick label="Subject" value={f.subjectId} onChange={(v) => setF({ ...f, subjectId: v })} options={subjects.options} loading={subjects.isPending} />
          </>
        )}
        {text("b-col", "Column name", "columnName", { maxLength: 100 })}
        <div className="flex gap-4">
          {COLUMN_FOR.map((c) => <Check key={c} label={c === "ar" ? "AR" : "Bluesheet"} checked={f.columnFor.includes(c)} onChange={() => setF({ ...f, columnFor: toggle(f.columnFor, c) as ColumnFor[] })} />)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {text("b-term", "Term", "term")}
          {text("b-max", "Max marks", "maxMarks", { type: "number" })}
          {text("b-formula", "Formula", "formula")}
          {text("b-order", "Order", "order", { type: "number", step: 1 })}
        </div>
        <Check label="Convert marks" checked={f.isConverted} onChange={() => setF({ ...f, isConverted: !f.isConverted })} />
        {f.isConverted && text("b-conv", "Converted marks", "convertedMarks", { type: "number" })}
        <Check label="Add in total" checked={f.addInTotal} onChange={() => setF({ ...f, addInTotal: !f.addInTotal })} />
        <Check label="Add in term 1 total" checked={f.addInTotalTerm1} onChange={() => setF({ ...f, addInTotalTerm1: !f.addInTotalTerm1 })} />
        {f.parts.map((p, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-md border p-2">
            <div className="flex items-center justify-between"><span className="text-sm font-medium">Part {i + 1}</span><Button type="button" variant="ghost" size="sm" aria-label={`Remove part ${i + 1}`} onClick={() => setF({ ...f, parts: f.parts.filter((_, j) => j !== i) })}>Remove</Button></div>
            <ExamChecks label="Exams" gradeId={f.gradeId} yearId={f.yearId} value={p.examIds} onChange={(v) => setPart(i, { examIds: v })} />
            <div className="grid grid-cols-3 gap-2">
              <Input aria-label={`Part ${i + 1} formula`} placeholder="Formula" value={p.formula} onChange={(e) => setPart(i, { formula: e.target.value })} />
              <Input aria-label={`Part ${i + 1} weightage`} placeholder="Weightage" type="number" value={p.weightage} onChange={(e) => setPart(i, { weightage: e.target.value })} />
              <Input aria-label={`Part ${i + 1} compare part`} placeholder="Compare (opt.)" type="number" value={p.comparePart} onChange={(e) => setPart(i, { comparePart: e.target.value })} />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => setF({ ...f, parts: [...f.parts, emptyPart()] })}>Add part</Button>
      </FormDialog>
      <DeleteConfirm target={rm?.column_name ?? null} what="bluesheet column" pending={del.isPending} onCancel={() => setRm(null)} onConfirm={() => rm && del.mutate(rm.id, { onSettled: () => setRm(null) })} />
    </div>
  )
}
