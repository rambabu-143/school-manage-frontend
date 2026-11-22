"use client"

import { useState } from "react"

import { Pick, useGradeOptions, useSubjectOptions, useYearOptions } from "@/app/(dashboard)/exam-records/pickers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDeleteSetting, useSaveSetting, useSettings } from "@/hooks/use-exam-settings"
import { buildWeightageCreate, buildWeightageUpdate, type WeightageForm } from "@/lib/exam-settings"
import { parseApiError } from "@/lib/shared/api-error"

import { DeleteConfirm, ExamChecks, FormDialog, SettingsTable } from "./shared"

interface Row { id: string; academic_year_id: string; grade_id: string; subject_id: string; column_name: string; short_name: string; formula: string; exam_name_ids: string[]; weightage: number; order: number }
const EMPTY: WeightageForm = { yearId: "", gradeId: "", subjectId: "", columnName: "", shortName: "", formula: "", examIds: [], weightage: "", order: "" }

export function WeightagesTab() {
  const years = useYearOptions(), grades = useGradeOptions(), subjects = useSubjectOptions()
  const [flt, setFlt] = useState({ year: "", grade: "", subject: "" })
  const q = useSettings<Row>("weightages", { academic_year_id: flt.year || undefined, grade_id: flt.grade || undefined, subject_id: flt.subject || undefined })
  const save = useSaveSetting("weightages")
  const del = useDeleteSetting("weightages")
  const [edit, setEdit] = useState<{ id?: string } | null>(null)
  const [f, setF] = useState(EMPTY)
  const [err, setErr] = useState<string>()
  const [rm, setRm] = useState<Row | null>(null)

  const open = (r?: Row) => {
    setF(r
      ? { yearId: r.academic_year_id, gradeId: r.grade_id, subjectId: r.subject_id, columnName: r.column_name, shortName: r.short_name, formula: r.formula, examIds: r.exam_name_ids, weightage: String(r.weightage), order: String(r.order) }
      : { ...EMPTY, yearId: flt.year, gradeId: flt.grade, subjectId: flt.subject })
    setErr(undefined)
    setEdit({ id: r?.id })
  }
  const submit = () => {
    const r = edit?.id ? buildWeightageUpdate(f) : buildWeightageCreate(f)
    if (r.error !== undefined) return setErr(r.error)
    save.mutate({ id: edit?.id, body: r.body }, { onSuccess: () => setEdit(null), onError: (e) => setErr(parseApiError(e).message) })
  }
  const field = (id: string, label: string, key: keyof WeightageForm, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="flex flex-col gap-1"><Label htmlFor={id}>{label}</Label><Input id={id} value={f[key] as string} onChange={(e) => setF({ ...f, [key]: e.target.value })} {...props} /></div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Pick label="Academic year" value={flt.year} onChange={(v) => setFlt({ ...flt, year: v })} options={years.options} loading={years.isPending} />
        <Pick label="Class" value={flt.grade} onChange={(v) => setFlt({ ...flt, grade: v })} options={grades.options} loading={grades.isPending} />
        <Pick label="Subject" value={flt.subject} onChange={(v) => setFlt({ ...flt, subject: v })} options={subjects.options} loading={subjects.isPending} />
        <Button onClick={() => open()}>New weightage</Button>
      </div>
      <SettingsTable
        rows={q.data} loading={q.isPending} error={q.error} name={(r) => r.column_name} onEdit={open} onDelete={setRm}
        columns={[
          { header: "Order", cell: (r) => r.order },
          { header: "Column", cell: (r) => `${r.column_name} (${r.short_name})` },
          { header: "Formula", cell: (r) => r.formula },
          { header: "Weightage", cell: (r) => r.weightage },
          { header: "Exams", cell: (r) => r.exam_name_ids.length },
        ]}
      />
      <FormDialog title={edit?.id ? "Edit weightage" : "New weightage"} open={!!edit} onClose={() => setEdit(null)} onSubmit={submit} pending={save.isPending} error={err}>
        {!edit?.id && (
          <>
            <Pick label="Academic year" value={f.yearId} onChange={(v) => setF({ ...f, yearId: v, examIds: [] })} options={years.options} loading={years.isPending} />
            <Pick label="Class" value={f.gradeId} onChange={(v) => setF({ ...f, gradeId: v, examIds: [] })} options={grades.options} loading={grades.isPending} />
            <Pick label="Subject" value={f.subjectId} onChange={(v) => setF({ ...f, subjectId: v })} options={subjects.options} loading={subjects.isPending} />
          </>
        )}
        {field("w-col", "Column name", "columnName", { maxLength: 100 })}
        {field("w-short", "Short name", "shortName", { maxLength: 50 })}
        {field("w-formula", "Formula", "formula", { maxLength: 100 })}
        <div className="grid grid-cols-2 gap-3">
          {field("w-weight", "Weightage", "weightage", { type: "number" })}
          {field("w-order", "Order", "order", { type: "number", step: 1 })}
        </div>
        <ExamChecks label="Exams" gradeId={f.gradeId} yearId={f.yearId} value={f.examIds} onChange={(v) => setF({ ...f, examIds: v })} />
      </FormDialog>
      <DeleteConfirm target={rm?.column_name ?? null} what="weightage" pending={del.isPending} onCancel={() => setRm(null)} onConfirm={() => rm && del.mutate(rm.id, { onSettled: () => setRm(null) })} />
    </div>
  )
}
