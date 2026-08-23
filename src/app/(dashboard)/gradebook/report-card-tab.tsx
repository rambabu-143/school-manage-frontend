"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { ExamSelect } from "@/components/exam-select"
import { StudentSelect } from "@/components/student-select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCumulativeReport, useReportCard } from "@/hooks/use-report-card"

export function ReportCardTab() {
  const [studentId, setStudentId] = React.useState<string>()
  const [examId, setExamId] = React.useState<string>()
  const [academicYearId, setAcademicYearId] = React.useState<string>()

  const { data: reportCard, isPending: reportCardPending } = useReportCard(studentId, examId)
  const { data: cumulative, isPending: cumulativePending } = useCumulativeReport(
    studentId,
    academicYearId
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label>Student</Label>
          <StudentSelect value={studentId} onChange={setStudentId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Exam (for report card)</Label>
          <ExamSelect value={examId} onChange={setExamId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Academic year (for cumulative report)</Label>
          <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
        </div>
      </div>

      {!studentId && (
        <p className="text-sm text-muted-foreground">Select a student to view their reports.</p>
      )}

      {studentId && examId && (
        <div className="flex flex-col gap-3">
          <h2 className="font-medium">Report card</h2>
          {reportCardPending && <p className="text-sm text-muted-foreground">Loading...</p>}
          {reportCard && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportCard.subjects.map((subject) => (
                    <TableRow key={subject.subject_id}>
                      <TableCell className="font-medium">{subject.subject_name}</TableCell>
                      <TableCell>
                        {subject.marks_obtained} / {subject.max_marks}
                      </TableCell>
                      <TableCell>{subject.percentage.toFixed(1)}%</TableCell>
                      <TableCell>{subject.remarks ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-sm text-muted-foreground">
                Total: {reportCard.total_obtained} / {reportCard.total_max} (
                {reportCard.overall_percentage.toFixed(1)}%)
              </p>
            </>
          )}
        </div>
      )}

      {studentId && examId && academicYearId && <Separator />}

      {studentId && academicYearId && (
        <div className="flex flex-col gap-3">
          <h2 className="font-medium">Cumulative report</h2>
          {cumulativePending && <p className="text-sm text-muted-foreground">Loading...</p>}
          {cumulative && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Weightage</TableHead>
                    <TableHead>%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cumulative.exams.map((exam) => (
                    <TableRow key={exam.exam_id}>
                      <TableCell className="font-medium">{exam.exam_name}</TableCell>
                      <TableCell>{exam.weightage}%</TableCell>
                      <TableCell>{exam.percentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-sm text-muted-foreground">
                Overall: {cumulative.overall_percentage.toFixed(1)}%
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
