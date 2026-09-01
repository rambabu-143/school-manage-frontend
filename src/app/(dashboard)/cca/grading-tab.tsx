"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { SectionSelect } from "@/components/section-select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCcaActivities, useCcaIndicators, useGradeCcaStudents } from "@/hooks/use-cca"
import { useEnrollments } from "@/hooks/use-enrollments"
import { useStudents } from "@/hooks/use-students"
import { CCA_GRADES, type CcaGrade } from "@/types/cca"

function GradingRoster({
  sectionId,
  indicatorId,
  academicYearId,
}: {
  sectionId: string
  indicatorId: string
  academicYearId: string
}) {
  const { data: enrollments, isPending } = useEnrollments(sectionId)
  const { data: students } = useStudents()
  const gradeStudents = useGradeCcaStudents()
  const [edits, setEdits] = React.useState<Record<string, CcaGrade>>({})

  const studentById = new Map(students?.map((s) => [s.id, s]))

  function onSubmit() {
    if (!enrollments || enrollments.length === 0) return
    const records = enrollments
      .filter((e) => edits[e.student_id])
      .map((e) => ({ student_id: e.student_id, grade: edits[e.student_id] }))
    if (records.length === 0) return
    gradeStudents.mutate(
      { indicator_id: indicatorId, academic_year_id: academicYearId, records },
      { onSuccess: () => setEdits({}) }
    )
  }

  if (isPending) return <p className="text-sm text-muted-foreground">Loading roster...</p>

  if (!enrollments || enrollments.length === 0) {
    return <p className="text-sm text-muted-foreground">No students enrolled in this section.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead className="w-40">Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => {
            const student = studentById.get(enrollment.student_id)
            return (
              <TableRow key={enrollment.id}>
                <TableCell className="font-medium">
                  {student ? `${student.first_name} ${student.last_name}` : "Unknown student"}
                </TableCell>
                <TableCell>
                  <Select
                    value={edits[enrollment.student_id]}
                    onValueChange={(value) =>
                      setEdits((prev) => ({ ...prev, [enrollment.student_id]: value as CcaGrade }))
                    }
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {CCA_GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={gradeStudents.isPending}>
          {gradeStudents.isPending && <Loader2 className="animate-spin" />}
          Save grades
        </Button>
      </div>
    </div>
  )
}

export function GradingTab() {
  const { data: activities } = useCcaActivities()
  const [activityId, setActivityId] = React.useState<string>()
  const { data: indicators } = useCcaIndicators(activityId)
  const [indicatorId, setIndicatorId] = React.useState<string>()
  const [sectionId, setSectionId] = React.useState<string>()
  const [academicYearId, setAcademicYearId] = React.useState<string>()

  const ready = sectionId && indicatorId && academicYearId

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label>Activity</Label>
          <Select
            value={activityId}
            onValueChange={(value) => {
              setActivityId(value)
              setIndicatorId(undefined)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an activity" />
            </SelectTrigger>
            <SelectContent>
              {activities?.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Indicator</Label>
          <Select value={indicatorId} onValueChange={setIndicatorId} disabled={!activityId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an indicator" />
            </SelectTrigger>
            <SelectContent>
              {indicators?.map((indicator) => (
                <SelectItem key={indicator.id} value={indicator.id}>
                  {indicator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Section</Label>
          <SectionSelect value={sectionId} onChange={setSectionId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Academic year</Label>
          <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
        </div>
      </div>

      {ready ? (
        <GradingRoster
          key={`${sectionId}-${indicatorId}-${academicYearId}`}
          sectionId={sectionId}
          indicatorId={indicatorId}
          academicYearId={academicYearId}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Select an activity, indicator, section, and academic year to grade students.
        </p>
      )}
    </div>
  )
}
