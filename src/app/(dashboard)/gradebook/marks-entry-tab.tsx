"use client"

import * as React from "react"

import { ExamSelect } from "@/components/exam-select"
import { SectionSelect } from "@/components/section-select"
import { SubjectSelect } from "@/components/subject-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { MarksRoster } from "./marks-roster"

export function MarksEntryTab() {
  const [sectionId, setSectionId] = React.useState<string>()
  const [examId, setExamId] = React.useState<string>()
  const [subjectId, setSubjectId] = React.useState<string>()
  const [maxMarks, setMaxMarks] = React.useState(100)

  const ready = sectionId && examId && subjectId && maxMarks > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label>Section</Label>
          <SectionSelect value={sectionId} onChange={setSectionId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Exam</Label>
          <ExamSelect value={examId} onChange={setExamId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Subject</Label>
          <SubjectSelect value={subjectId} onChange={setSubjectId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Max marks</Label>
          <Input
            type="number"
            min={1}
            value={maxMarks}
            onChange={(e) => setMaxMarks(Number(e.target.value))}
          />
        </div>
      </div>

      {ready ? (
        <MarksRoster
          key={`${sectionId}-${examId}-${subjectId}-${maxMarks}`}
          sectionId={sectionId}
          examId={examId}
          subjectId={subjectId}
          maxMarks={maxMarks}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Select a section, exam, subject, and max marks to enter marks.
        </p>
      )}
    </div>
  )
}
