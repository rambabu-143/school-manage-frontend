"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { StudentSelect } from "@/components/student-select"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCcaReportCard } from "@/hooks/use-cca"

export function ReportCardTab() {
  const [studentId, setStudentId] = React.useState<string>()
  const [academicYearId, setAcademicYearId] = React.useState<string>()

  const { data: reportCard, isPending } = useCcaReportCard(studentId, academicYearId)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Student</Label>
          <StudentSelect value={studentId} onChange={setStudentId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Academic year</Label>
          <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
        </div>
      </div>

      {!studentId || !academicYearId ? (
        <p className="text-sm text-muted-foreground">
          Select a student and academic year to view their CCA report card.
        </p>
      ) : isPending ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !reportCard || reportCard.entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No CCA grades recorded yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Indicator</TableHead>
              <TableHead>Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportCard.entries.map((entry) => (
              <TableRow key={entry.indicator_id}>
                <TableCell className="font-medium">{entry.activity_name}</TableCell>
                <TableCell>{entry.indicator_name}</TableCell>
                <TableCell>{entry.grade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
