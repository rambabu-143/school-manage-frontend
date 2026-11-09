"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import { parseApiError } from "@/lib/shared/api-error"

import { Pick, useSectionOptions, useSubjectOptions, useYearOptions } from "./pickers"

interface ExamName { id: string; exam_name: string; short_name?: string; terms?: string[]; max_marks: number; weightage?: number }
interface SubjectExam { id: string; exam_name: string; exam_level: number; exam_marks: number; parent_id?: string | null }

function List({ q, children }: { q: { isPending: boolean; isError: boolean; error: unknown; data?: unknown[] }; children: React.ReactNode }) {
  if (q.isPending) return <p role="status" className="text-sm text-muted-foreground">Loading...</p>
  if (q.isError) return <p role="alert" className="text-sm text-destructive">{parseApiError(q.error).message}</p>
  if (!q.data?.length) return <p className="text-sm text-muted-foreground">Nothing found.</p>
  return <ul className="divide-y rounded-md border text-sm">{children}</ul>
}

export function ExamNamesTab() {
  const years = useYearOptions()
  const [wing, setWing] = useState("junior")
  const [yearId, setYearId] = useState("")
  const q = useQuery({
    queryKey: qk("exam-records", "exam-names", wing, yearId),
    queryFn: async () => (await apiClient.get<ExamName[]>(`/exam/${wing}/exam-names`, { params: { academic_year_id: yearId || undefined } })).data,
  })
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Pick label="Wing" value={wing} onChange={(v) => setWing(v || "junior")} options={[{ value: "junior", label: "Junior" }, { value: "senior", label: "Senior" }]} />
        <Pick label="Academic year" value={yearId} onChange={setYearId} options={years.options} loading={years.isPending} />
      </div>
      <List q={q}>
        {q.data?.map((e) => (
          <li key={e.id} className="flex justify-between p-3"><span>{e.exam_name}{e.short_name ? ` (${e.short_name})` : ""}</span><span className="text-muted-foreground">max {e.max_marks}{e.weightage ? `, weightage ${e.weightage}` : ""}</span></li>
        ))}
      </List>
      <p className="text-xs text-muted-foreground">Read-only view. Marks entry and per-exam locks live under Gradebook.</p>
    </div>
  )
}

export function SubjectExamsTab() {
  const sections = useSectionOptions()
  const subjects = useSubjectOptions()
  const [sectionId, setSectionId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const q = useQuery({
    queryKey: qk("exam-records", "subject-exams", sectionId, subjectId),
    enabled: !!sectionId,
    queryFn: async () => (await apiClient.get<SubjectExam[]>("/subject-exams", { params: { section_id: sectionId, subject_id: subjectId || undefined } })).data,
  })
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Pick label="Section" value={sectionId} onChange={setSectionId} options={sections.options} loading={sections.isPending} />
        <Pick label="Subject (optional)" value={subjectId} onChange={setSubjectId} options={subjects.options} loading={subjects.isPending} />
      </div>
      {!sectionId ? <p className="text-sm text-muted-foreground">Choose a section.</p> : (
        <List q={q}>
          {q.data?.map((e) => (
            <li key={e.id} className="flex justify-between p-3" style={{ paddingLeft: `${0.75 + e.exam_level * 1.25}rem` }}><span>{e.exam_name}</span><span className="text-muted-foreground">{e.exam_marks} marks</span></li>
          ))}
        </List>
      )}
    </div>
  )
}
