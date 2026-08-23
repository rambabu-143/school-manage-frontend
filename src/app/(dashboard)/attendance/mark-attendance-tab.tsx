"use client"

import * as React from "react"

import { SectionSelect } from "@/components/section-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { MarkAttendanceRoster } from "./mark-attendance-roster"

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function MarkAttendanceTab() {
  const [sectionId, setSectionId] = React.useState<string>()
  const [date, setDate] = React.useState(today)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label>Section</Label>
          <SectionSelect value={sectionId} onChange={setSectionId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {sectionId ? (
        <MarkAttendanceRoster key={`${sectionId}-${date}`} sectionId={sectionId} date={date} />
      ) : (
        <p className="text-sm text-muted-foreground">Select a section to mark attendance.</p>
      )}
    </div>
  )
}
