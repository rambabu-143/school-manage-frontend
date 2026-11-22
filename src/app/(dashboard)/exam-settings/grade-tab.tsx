"use client"

import { useState } from "react"

import { Pick, useGradeOptions, useYearOptions } from "@/app/(dashboard)/exam-records/pickers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDeleteSetting, useSaveSetting, useSettings } from "@/hooks/use-exam-settings"
import { buildGradeSetting, type GradeSettingForm } from "@/lib/exam-settings"
import { parseApiError } from "@/lib/shared/api-error"

import { Check, DeleteConfirm, FormDialog, Group, SettingsTable, toggle } from "./shared"

interface Row { id: string; academic_year_id: string; grade: string; grade_ids: string[]; min_marks: number; max_marks: number; order: number }
const EMPTY: GradeSettingForm = { yearId: "", grade: "", gradeIds: [], min: "", max: "", order: "" }

export function GradeSettingsTab() {
  const years = useYearOptions()
  const grades = useGradeOptions()
  const [yearFilter, setYearFilter] = useState("")
  const q = useSettings<Row>("grade-settings", { academic_year_id: yearFilter || undefined })
  const save = useSaveSetting("grade-settings")
  const del = useDeleteSetting("grade-settings")
  const [edit, setEdit] = useState<{ id?: string } | null>(null)
  const [f, setF] = useState(EMPTY)
  const [err, setErr] = useState<string>()
  const [rm, setRm] = useState<Row | null>(null)
  const gradeName = new Map(grades.options?.map((g) => [g.value, g.label]))

  const open = (r?: Row) => {
    setF(r ? { yearId: r.academic_year_id, grade: r.grade, gradeIds: r.grade_ids, min: String(r.min_marks), max: String(r.max_marks), order: String(r.order) } : { ...EMPTY, yearId: yearFilter })
    setErr(undefined)
    setEdit({ id: r?.id })
  }
  const submit = () => {
    const r = buildGradeSetting(f)
    if (r.error !== undefined) return setErr(r.error)
    save.mutate({ id: edit?.id, body: r.body }, { onSuccess: () => setEdit(null), onError: (e) => setErr(parseApiError(e).message) })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Pick label="Academic year" value={yearFilter} onChange={setYearFilter} options={years.options} loading={years.isPending} />
        <Button onClick={() => open()}>New grade band</Button>
      </div>
      <SettingsTable
        rows={q.data} loading={q.isPending} error={q.error} name={(r) => r.grade} onEdit={open} onDelete={setRm}
        columns={[
          { header: "Order", cell: (r) => r.order },
          { header: "Grade", cell: (r) => r.grade },
          { header: "Marks", cell: (r) => `${r.min_marks} - ${r.max_marks}` },
          { header: "Classes", cell: (r) => r.grade_ids.map((g) => gradeName.get(g) ?? "?").join(", ") },
        ]}
      />
      <FormDialog title={edit?.id ? "Edit grade band" : "New grade band"} open={!!edit} onClose={() => setEdit(null)} onSubmit={submit} pending={save.isPending} error={err}>
        <Pick label="Academic year" value={f.yearId} onChange={(v) => setF({ ...f, yearId: v })} options={years.options} loading={years.isPending} />
        <div className="flex flex-col gap-1"><Label htmlFor="gs-grade">Grade (e.g. A1)</Label><Input id="gs-grade" maxLength={20} value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value })} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1"><Label htmlFor="gs-min">Min marks</Label><Input id="gs-min" type="number" min={0} value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} /></div>
          <div className="flex flex-col gap-1"><Label htmlFor="gs-max">Max marks</Label><Input id="gs-max" type="number" min={0} value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} /></div>
          <div className="flex flex-col gap-1"><Label htmlFor="gs-order">Order</Label><Input id="gs-order" type="number" step={1} value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} /></div>
        </div>
        <Group label="Classes">
          {grades.options?.map((g) => <Check key={g.value} label={g.label} checked={f.gradeIds.includes(g.value)} onChange={() => setF({ ...f, gradeIds: toggle(f.gradeIds, g.value) })} />)}
        </Group>
      </FormDialog>
      <DeleteConfirm target={rm?.grade ?? null} what="grade band" pending={del.isPending} onCancel={() => setRm(null)} onConfirm={() => rm && del.mutate(rm.id, { onSettled: () => setRm(null) })} />
    </div>
  )
}
