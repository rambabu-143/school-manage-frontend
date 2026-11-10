"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { Field, staffName } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { StaffSelect } from "@/components/staff-select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useGrades } from "@/hooks/use-grades"
import { useSectionAssignments, useSetClassTeacher, useSetHelperTeacher, useAddStandardTeacher, useRemoveStandardTeacher, useStandardTeachers } from "@/hooks/use-teacher-assignment"
import { useStaff } from "@/hooks/use-staff"
import type { components } from "@/lib/api-types"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

type SA = components["schemas"]["SectionAssignmentRead"]

export function ClassHelperTab({ canEdit }: { canEdit: boolean }) {
  const [year, setYear] = React.useState<string>()
  const [gradeId, setGradeId] = React.useState<string>()
  const q = useSectionAssignments(year, gradeId)
  const staff = useStaff()
  const grades = useGrades()
  const cls = useSetClassTeacher()
  const helper = useSetHelperTeacher()
  const std = useStandardTeachers()
  const addStd = useAddStandardTeacher()
  const [rmT, setRmT] = React.useState<{ id: string; staff_name: string } | null>(null)
  const rmStd = useRemoveStandardTeacher()
  const [target, setTarget] = React.useState<{ row: SA; role: "class" | "helper" } | null>(null)
  const [pick, setPick] = React.useState<string>()
  const [stdGrade, setStdGrade] = React.useState<string>()
  const [stdStaff, setStdStaff] = React.useState<string>()
  const busy = cls.isPending || helper.isPending

  function apply(type: "ASSIGN" | "UNASSIGN") {
    if (!target) return
    const done = { onSuccess: () => { setTarget(null); setPick(undefined) } }
    if (target.role === "class") {
      const sid = type === "ASSIGN" ? pick : target.row.class_teacher_id
      if (sid) cls.mutate({ staff_id: sid, type, section_id: target.row.section_id }, done)
    } else if (pick) helper.mutate({ staff_id: pick, type, section_ids: [target.row.section_id] }, done)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Academic year"><AcademicYearSelect value={year} onChange={setYear} /></Field>
        <Field label="Grade (optional)">
          <select aria-label="Grade" className="h-9 rounded-md border bg-background px-2 text-sm" value={gradeId ?? ""} onChange={(e) => setGradeId(e.target.value || undefined)}>
            <option value="">All grades</option>
            {grades.data?.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </Field>
      </div>
      {!year ? <p className="text-sm text-muted-foreground">Select an academic year.</p> : (
        <RowsTable rows={q.data} isLoading={q.isPending} error={q.error} onRetry={() => q.refetch()} empty="No sections."
          columns={[
            { accessorKey: "name", header: "Section" },
            { id: "ct", header: "Class teacher", cell: ({ row }) => staffName(staff.data, row.original.class_teacher_id) },
            { id: "ht", header: "Helper teachers", cell: ({ row }) => row.original.helper_teacher_ids.map((i) => staffName(staff.data, i)).join(", ") || "-" },
            ...(canEdit ? [{ id: "a", header: () => <span className="sr-only">Actions</span>, cell: ({ row }: { row: { original: SA } }) => (
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="outline" onClick={() => { setPick(undefined); setTarget({ row: row.original, role: "class" }) }}>Class teacher</Button>
                <Button size="sm" variant="outline" onClick={() => { setPick(undefined); setTarget({ row: row.original, role: "helper" }) }}>Helper</Button>
              </div>) }] : []),
          ]} />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Grade (standard) teachers</h2>
        {canEdit && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="Grade">
              <select aria-label="Grade for standard teacher" className="h-9 rounded-md border bg-background px-2 text-sm" value={stdGrade ?? ""} onChange={(e) => setStdGrade(e.target.value || undefined)}>
                <option value="">Select</option>
                {grades.data?.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
            <Field label="Teacher"><StaffSelect value={stdStaff} onChange={setStdStaff} /></Field>
            <Button disabled={!stdGrade || !stdStaff || addStd.isPending} onClick={() => addStd.mutate({ grade_id: stdGrade!, staff_id: stdStaff! })}>Add</Button>
          </div>
        )}
        <RowsTable rows={std.data} isLoading={std.isPending} error={std.error} onRetry={() => std.refetch()} empty="No grade teachers."
          columns={[
            { accessorKey: "grade_name", header: "Grade" }, { accessorKey: "staff_name", header: "Teacher" },
            ...(canEdit ? [{ id: "a", header: () => <span className="sr-only">Actions</span>, cell: ({ row }: { row: { original: { id: string; staff_name: string } } }) => (
              <div className="flex justify-end"><Button size="sm" variant="ghost" aria-label={`Remove ${row.original.staff_name}`} onClick={() => setRmT(row.original)}>Remove</Button></div>) }] : []),
          ]} />
      </section>

      <ConfirmDialog open={!!rmT} onOpenChange={(o) => !o && setRmT(null)} destructive isPending={rmStd.isPending} confirmLabel="Remove"
        title="Remove grade teacher?" description={rmT ? `This removes ${rmT.staff_name} as grade teacher.` : ""}
        onConfirm={() => rmT && rmStd.mutate(rmT.id, { onSettled: () => setRmT(null) })} />

      <Dialog open={!!target} onOpenChange={(o) => !o && !busy && setTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{target?.role === "class" ? "Class teacher" : "Helper teacher"}: {target?.row.name}</DialogTitle></DialogHeader>
          <Field label="Staff member"><StaffSelect value={pick} onChange={setPick} /></Field>
          <DialogFooter className="gap-2">
            {target?.role === "class" && target.row.class_teacher_id && <Button variant="outline" disabled={busy} onClick={() => apply("UNASSIGN")}>Unassign current</Button>}
            {target?.role === "helper" && <Button variant="outline" disabled={busy || !pick} onClick={() => apply("UNASSIGN")}>Unassign selected</Button>}
            <Button disabled={!pick || busy} onClick={() => apply("ASSIGN")}>{busy ? "Saving..." : "Assign"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
