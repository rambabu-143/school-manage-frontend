"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { SectionSelect } from "@/components/section-select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDemoteStudents,
  usePromoteStudentsSession,
  usePromotionSlip,
  usePromotionStudents,
} from "@/hooks/use-session-promotion"
import { useSections } from "@/hooks/use-sections"
import { errorMessage } from "@/lib/error-message"

function csvCell(v: string) {
  return `"${v.replace(/"/g, '""')}"`
}

export default function PromotionPage() {
  const [sectionId, setSectionId] = React.useState<string>()
  const [targetSectionId, setTargetSectionId] = React.useState<string>()
  const [demoteYearId, setDemoteYearId] = React.useState<string>()
  const [picked, setPicked] = React.useState<Set<string>>(new Set())
  const [confirmDemote, setConfirmDemote] = React.useState(false)

  const { data: sections } = useSections()
  const students = usePromotionStudents(sectionId)
  const slip = usePromotionSlip(sectionId)
  const promote = usePromoteStudentsSession()
  const demote = useDemoteStudents()
  const rows = students.data ?? []
  const sourceYearId = sections?.find((s) => s.id === sectionId)?.academic_year_id
  const ids = [...picked]

  function changeSection(v: string) {
    setSectionId(v)
    setPicked(new Set())
  }
  function toggle(id: string) {
    setPicked((p) => {
      const n = new Set(p)
      if (!n.delete(id)) n.add(id)
      return n
    })
  }
  function downloadSlip() {
    const s = slip.data
    if (!s) return
    const head = ["Admission no.", "First name", "Last name", "Date of birth"]
    const lines = [head, ...s.students.map((x) => [x.admission_number, x.first_name, x.last_name, x.date_of_birth])]
    const blob = new Blob([lines.map((l) => l.map(csvCell).join(",")).join("\n")], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `promotion-slip-${s.grade_name}-${s.section_name}.csv`.replace(/\s+/g, "_")
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Session promotion</h1>
        <p className="text-sm text-muted-foreground">Promote selected students into a section of the next session, or reverse a promotion.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1"><Label>From section</Label><SectionSelect value={sectionId} onChange={changeSection} /></div>
        <div className="space-y-1"><Label>Promote into section</Label><SectionSelect value={targetSectionId} onChange={setTargetSectionId} /></div>
        <div className="space-y-1"><Label>Demote from academic year</Label><AcademicYearSelect value={demoteYearId} onChange={setDemoteYearId} /></div>
      </div>

      {!sectionId ? (
        <p className="text-sm text-muted-foreground">Select a section to list its students.</p>
      ) : students.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : students.isError ? (
        <p role="alert" className="text-sm text-destructive">{errorMessage(students.error)}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No students in this section.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={picked.size === rows.length}
                    onChange={(e) => setPicked(e.target.checked ? new Set(rows.map((r) => r.student_id)) : new Set())}
                  />
                </th>
                <th>Admission no.</th><th>Name</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student_id} className="border-t">
                  <td className="p-2">
                    <input type="checkbox" aria-label={`Select ${r.first_name} ${r.last_name}`} checked={picked.has(r.student_id)} onChange={() => toggle(r.student_id)} />
                  </td>
                  <td>{r.admission_number}</td>
                  <td>{r.first_name} {r.last_name}</td>
                  <td>{r.is_detained ? "Detained" : r.migrated ? "Promoted" : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!sourceYearId || !targetSectionId || ids.length === 0 || promote.isPending}
          onClick={() =>
            promote.mutate(
              { source_academic_year_id: sourceYearId!, target_section_id: targetSectionId!, student_ids: ids },
              { onSuccess: () => setPicked(new Set()) }
            )
          }
        >
          Promote {ids.length || ""} selected
        </Button>
        <Button variant="destructive" disabled={!demoteYearId || ids.length === 0 || demote.isPending} onClick={() => setConfirmDemote(true)}>
          Demote {ids.length || ""} selected
        </Button>
        <Button variant="outline" disabled={!slip.data} onClick={downloadSlip}>Download promotion slip (CSV)</Button>
      </div>
      {slip.isError && <p role="alert" className="text-sm text-destructive">{errorMessage(slip.error)}</p>}

      <ConfirmDialog
        open={confirmDemote}
        onOpenChange={setConfirmDemote}
        title="Demote students?"
        description={`This reverses the promotion of ${ids.length} selected student(s) from the chosen academic year.`}
        confirmLabel="Demote"
        destructive
        isPending={demote.isPending}
        onConfirm={() =>
          demote.mutate(
            { academic_year_id: demoteYearId!, student_ids: ids },
            { onSuccess: () => { setConfirmDemote(false); setPicked(new Set()) } }
          )
        }
      />
    </div>
  )
}
