"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { StudentSelect } from "@/components/student-select"
import { Label } from "@/components/ui/label"

import { SelectionForm } from "./selection-form"

export function SelectionsTab() {
  const [studentId, setStudentId] = React.useState<string>()
  const [academicYearId, setAcademicYearId] = React.useState<string>()

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Student</Label>
        <StudentSelect value={studentId} onChange={setStudentId} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Academic year</Label>
        <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
      </div>

      {studentId && academicYearId ? (
        <SelectionForm
          key={`${studentId}-${academicYearId}`}
          studentId={studentId}
          academicYearId={academicYearId}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Select a student and academic year to manage their stream.
        </p>
      )}
    </div>
  )
}
