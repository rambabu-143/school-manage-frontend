"use client"

import * as React from "react"

import { ExamSelect } from "@/components/exam-select"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useChildReportCard } from "@/hooks/use-portal"

export function ReportCardTab({ studentId }: { studentId: string }) {
  const [examId, setExamId] = React.useState<string>()
  const { data: reportCard, isPending } = useChildReportCard(studentId, examId)

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-sm flex flex-col gap-2">
        <Label>Exam</Label>
        <ExamSelect value={examId} onChange={setExamId} />
      </div>

      {!examId && <p className="text-sm text-muted-foreground">Select an exam to view marks.</p>}
      {examId && isPending && <p className="text-sm text-muted-foreground">Loading...</p>}
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
  )
}
