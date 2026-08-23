"use client"

import * as React from "react"

import { StudentSelect } from "@/components/student-select"
import { Label } from "@/components/ui/label"

import { AllocateForm } from "./allocate-form"

export function AllocateTab() {
  const [studentId, setStudentId] = React.useState<string>()

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Student</Label>
        <StudentSelect value={studentId} onChange={setStudentId} />
      </div>

      {studentId ? (
        <AllocateForm key={studentId} studentId={studentId} />
      ) : (
        <p className="text-sm text-muted-foreground">Select a student to manage hostel allocation.</p>
      )}
    </div>
  )
}
