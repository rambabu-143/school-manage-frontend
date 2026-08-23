"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEnrollments } from "@/hooks/use-enrollments"
import { useMarks, useMarkStudents } from "@/hooks/use-marks"
import { useStudents } from "@/hooks/use-students"

interface MarkEdit {
  marksObtained: number
  remarks: string
}

interface MarksRosterProps {
  sectionId: string
  examId: string
  subjectId: string
  maxMarks: number
}

export function MarksRoster({ sectionId, examId, subjectId, maxMarks }: MarksRosterProps) {
  const { data: enrollments, isPending: enrollmentsPending } = useEnrollments(sectionId)
  const { data: students } = useStudents()
  const { data: existing, isPending: existingPending } = useMarks({ examId, subjectId })
  const markStudents = useMarkStudents()

  const [edits, setEdits] = React.useState<Record<string, MarkEdit>>({})

  const studentById = new Map(students?.map((s) => [s.id, s]))
  const existingByStudent = new Map(existing?.map((m) => [m.student_id, m]))
  const isPending = enrollmentsPending || existingPending

  function editFor(studentId: string): MarkEdit {
    if (edits[studentId]) return edits[studentId]
    const record = existingByStudent.get(studentId)
    return { marksObtained: record?.marks_obtained ?? 0, remarks: record?.remarks ?? "" }
  }

  function setEdit(studentId: string, patch: Partial<MarkEdit>) {
    setEdits((prev) => ({ ...prev, [studentId]: { ...editFor(studentId), ...patch } }))
  }

  function onSubmit() {
    if (!enrollments || enrollments.length === 0) return
    markStudents.mutate({
      exam_id: examId,
      subject_id: subjectId,
      max_marks: maxMarks,
      records: enrollments.map((e) => {
        const edit = editFor(e.student_id)
        return {
          student_id: e.student_id,
          marks_obtained: edit.marksObtained,
          remarks: edit.remarks || null,
        }
      }),
    })
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
            <TableHead className="w-32">Marks / {maxMarks}</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => {
            const student = studentById.get(enrollment.student_id)
            const edit = editFor(enrollment.student_id)
            return (
              <TableRow key={enrollment.id}>
                <TableCell className="font-medium">
                  {student ? `${student.first_name} ${student.last_name}` : "Unknown student"}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    max={maxMarks}
                    value={edit.marksObtained}
                    onChange={(e) =>
                      setEdit(enrollment.student_id, {
                        marksObtained: Number(e.target.value),
                      })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={edit.remarks}
                    placeholder="Optional"
                    onChange={(e) => setEdit(enrollment.student_id, { remarks: e.target.value })}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={markStudents.isPending}>
          {markStudents.isPending && <Loader2 className="animate-spin" />}
          Save marks
        </Button>
      </div>
    </div>
  )
}
