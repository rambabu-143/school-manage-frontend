"use client"

import * as React from "react"

import { SectionSelect } from "@/components/section-select"
import { StudentSelect } from "@/components/student-select"
import { Label } from "@/components/ui/label"
import { useChangeSection } from "@/hooks/use-session-promotion"
import { buildChangeSectionBody } from "@/lib/promotion-payloads"

import { OpCard } from "./op-card"

export function ChangeSectionTab() {
  const [studentId, setStudentId] = React.useState<string>()
  const [toSection, setToSection] = React.useState<string>()
  const [carry, setCarry] = React.useState(true)
  const change = useChangeSection()
  const body = buildChangeSectionBody(studentId, toSection, carry)
  const r = change.data
  return (
    <OpCard title="Change section" description="Move a student's active enrollment to another section." countLabel="1 student"
      ready={!!body} isPending={change.isPending} error={change.error} result={r && { marks_updated: r.marks_updated ?? 0 }}
      onRun={() => body && change.mutate(body)}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1"><Label>Student</Label><StudentSelect value={studentId} onChange={setStudentId} /></div>
        <div className="space-y-1"><Label>To section</Label><SectionSelect value={toSection} onChange={setToSection} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={carry} onChange={(e) => setCarry(e.target.checked)} /> Carry exam marks to the new section</label>
    </OpCard>
  )
}
