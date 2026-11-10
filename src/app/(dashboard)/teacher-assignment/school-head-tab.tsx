"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { Field } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { StaffSelect } from "@/components/staff-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGrades } from "@/hooks/use-grades"
import { useSchoolHeads, useSetSchoolHead } from "@/hooks/use-teacher-assignment"

export function SchoolHeadTab({ canEdit }: { canEdit: boolean }) {
  const [year, setYear] = React.useState<string>()
  const [headType, setHeadType] = React.useState("HM")
  const [grade, setGrade] = React.useState<string>()
  const [staffId, setStaffId] = React.useState<string>()
  const grades = useGrades()
  const heads = useSchoolHeads(headType.trim(), year)
  const set = useSetSchoolHead()
  const body = (type: "ASSIGN" | "UNASSIGN") => ({ type, grade_id: grade!, academic_year_id: year!, head_type: headType.trim(), staff_id: type === "ASSIGN" ? staffId : null })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Academic year"><AcademicYearSelect value={year} onChange={setYear} /></Field>
        <Field label="Head type"><Input value={headType} onChange={(e) => setHeadType(e.target.value)} placeholder="e.g. HM, VP, HOD" maxLength={50} /></Field>
      </div>
      {!year || !headType.trim() ? <p className="text-sm text-muted-foreground">Choose an academic year and head type.</p> : (
        <RowsTable rows={heads.data} isLoading={heads.isPending} error={heads.error} onRetry={() => heads.refetch()} empty="No grades."
          columns={[{ accessorKey: "grade_name", header: "Grade" }, { id: "s", header: "Head", cell: ({ row }) => (row.original.staff_id ? "Assigned" : "-") }, { accessorKey: "staff_id", header: "Staff id" }]} />
      )}
      {canEdit && year && headType.trim() && (
        <section className="flex flex-col gap-3 rounded-md border p-4">
          <h2 className="font-medium">Set school head for a grade</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="Grade">
              <select aria-label="Grade" className="h-9 rounded-md border bg-background px-2 text-sm" value={grade ?? ""} onChange={(e) => setGrade(e.target.value || undefined)}>
                <option value="">Select</option>
                {grades.data?.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
            <Field label="Staff"><StaffSelect value={staffId} onChange={setStaffId} /></Field>
            <Button disabled={!grade || !staffId || set.isPending} onClick={() => set.mutate(body("ASSIGN"))}>Assign</Button>
            <Button variant="outline" disabled={!grade || set.isPending} onClick={() => set.mutate(body("UNASSIGN"))}>Unassign</Button>
          </div>
        </section>
      )}
    </div>
  )
}
