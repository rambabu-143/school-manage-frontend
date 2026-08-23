"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEnrollments } from "@/hooks/use-enrollments"
import { useMarkStudentAttendance, useStudentAttendance } from "@/hooks/use-student-attendance"
import { useStudents } from "@/hooks/use-students"
import { ATTENDANCE_STATUSES, type AttendanceStatus } from "@/types/attendance"

interface RosterEdit {
  status: AttendanceStatus
  remarks: string
}

function statusLabel(status: AttendanceStatus) {
  return status.replace("_", " ")
}

export function MarkAttendanceRoster({ sectionId, date }: { sectionId: string; date: string }) {
  const { data: enrollments, isPending: enrollmentsPending } = useEnrollments(sectionId)
  const { data: students } = useStudents()
  const { data: existing, isPending: existingPending } = useStudentAttendance({
    sectionId,
    dateFrom: date,
    dateTo: date,
  })
  const markAttendance = useMarkStudentAttendance()

  const [edits, setEdits] = React.useState<Record<string, RosterEdit>>({})

  const studentById = new Map(students?.map((s) => [s.id, s]))
  const existingByStudent = new Map(existing?.map((r) => [r.student_id, r]))
  const isPending = enrollmentsPending || existingPending

  function editFor(studentId: string): RosterEdit {
    if (edits[studentId]) return edits[studentId]
    const record = existingByStudent.get(studentId)
    return { status: record?.status ?? "present", remarks: record?.remarks ?? "" }
  }

  function setEdit(studentId: string, patch: Partial<RosterEdit>) {
    setEdits((prev) => ({ ...prev, [studentId]: { ...editFor(studentId), ...patch } }))
  }

  function onSubmit() {
    if (!enrollments || enrollments.length === 0) return
    markAttendance.mutate({
      section_id: sectionId,
      date,
      records: enrollments.map((e) => {
        const edit = editFor(e.student_id)
        return {
          student_id: e.student_id,
          status: edit.status,
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
            <TableHead className="w-40">Status</TableHead>
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
                  <Select
                    value={edit.status}
                    onValueChange={(value) =>
                      setEdit(enrollment.student_id, { status: value as AttendanceStatus })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTENDANCE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {statusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
        <Button onClick={onSubmit} disabled={markAttendance.isPending}>
          {markAttendance.isPending && <Loader2 className="animate-spin" />}
          Save attendance
        </Button>
      </div>
    </div>
  )
}
