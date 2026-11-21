"use client"

import * as React from "react"

import { Field, StaffChecklist, staffName } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { SectionSelect } from "@/components/section-select"
import { Button } from "@/components/ui/button"
import { useSectionStaff, useSectionSubjectTeachers, useSetSubjectTeacher } from "@/hooks/use-teacher-assignment"
import { useStaff } from "@/hooks/use-staff"
import { useSubjects } from "@/hooks/use-subjects"

export function SubjectTeachersTab({ canEdit }: { canEdit: boolean }) {
  const [section, setSection] = React.useState<string>()
  const [subject, setSubject] = React.useState<string>()
  const [ids, setIds] = React.useState<string[]>([])
  const groups = useSectionSubjectTeachers(section)
  const sectionStaff = useSectionStaff(section)
  const subjects = useSubjects()
  const staff = useStaff()
  const set = useSetSubjectTeacher()

  const run = (type: "ASSIGN" | "UNASSIGN") =>
    set.mutate({ type, section_id: section!, subject_id: subject!, staff_ids: ids, is_part_subject: false, part_subject_name: "" } as never, { onSuccess: () => setIds([]) })

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-md"><Field label="Section"><SectionSelect value={section} onChange={(v) => { setSection(v); setIds([]) }} /></Field></div>
      {!section ? <p className="text-sm text-muted-foreground">Select a section.</p> : (<>
        <RowsTable rows={groups.data} isLoading={groups.isPending} error={groups.error} onRetry={() => groups.refetch()} empty="No subject teachers assigned."
          columns={[
            { accessorKey: "subject_name", header: "Subject" },
            { id: "t", header: "Teachers", cell: ({ row }) => row.original.teachers.map((t) => staffName(staff.data, t.staff_id)).join(", ") || "-" },
          ]} />
        {canEdit && (
          <section className="flex flex-col gap-3 rounded-md border p-4">
            <h2 className="font-medium">Assign / unassign</h2>
            <Field label="Subject">
              <select aria-label="Subject" className="h-9 rounded-md border bg-background px-2 text-sm" value={subject ?? ""} onChange={(e) => setSubject(e.target.value || undefined)}>
                <option value="">Select</option>
                {subjects.data?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <StaffChecklist value={ids} onChange={setIds} />
            <div className="flex gap-2">
              <Button disabled={!subject || !ids.length || set.isPending} onClick={() => run("ASSIGN")}>Assign</Button>
              <Button variant="outline" disabled={!subject || !ids.length || set.isPending} onClick={() => run("UNASSIGN")}>Unassign</Button>
            </div>
          </section>
        )}
        <section className="flex flex-col gap-2">
          <h2 className="font-medium">Section staff</h2>
          <RowsTable rows={sectionStaff.data} isLoading={sectionStaff.isPending} error={sectionStaff.error} onRetry={() => sectionStaff.refetch()} empty="No staff linked to this section."
            columns={[
              { accessorKey: "subject_name", header: "Subject" },
              { id: "t", header: "Teachers", cell: ({ row }) => row.original.teachers.map((t) => staffName(staff.data, t.staff_id)).join(", ") || "-" },
            ]} />
        </section>
      </>)}
    </div>
  )
}
