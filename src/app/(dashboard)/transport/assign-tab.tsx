"use client"

import * as React from "react"

import { StudentSelect } from "@/components/student-select"
import { Label } from "@/components/ui/label"

import { AssignForm } from "./assign-form"

export function AssignTab() {
  const [studentId, setStudentId] = React.useState<string>()

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Student</Label>
        <StudentSelect value={studentId} onChange={setStudentId} />
      </div>

      {studentId ? (
        <AssignForm key={studentId} studentId={studentId} />
      ) : (
        <p className="text-sm text-muted-foreground">Select a student to manage transport.</p>
      )}
    </div>
  )
}
