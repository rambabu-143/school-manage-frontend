"use client"

import * as React from "react"

import { SectionSelect } from "@/components/section-select"
import { SubjectSelect } from "@/components/subject-select"
import { Label } from "@/components/ui/label"
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
import { useSectionCoverage } from "@/hooks/use-section-coverage"
import { useUpdateSyllabusProgress } from "@/hooks/use-syllabus-topics"
import { PROGRESS_STATUSES, type ProgressStatus } from "@/types/syllabus"

function statusLabel(status: string) {
  return status.replace("_", " ")
}

export function CoverageTab() {
  const [sectionId, setSectionId] = React.useState<string>()
  const [subjectId, setSubjectId] = React.useState<string>()

  const { data: coverage, isPending } = useSectionCoverage(sectionId, subjectId)
  const updateProgress = useUpdateSyllabusProgress()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Section</Label>
          <SectionSelect value={sectionId} onChange={setSectionId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Subject</Label>
          <SubjectSelect value={subjectId} onChange={setSubjectId} />
        </div>
      </div>

      {!sectionId || !subjectId ? (
        <p className="text-sm text-muted-foreground">
          Select a section and subject to view coverage.
        </p>
      ) : isPending ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : coverage && coverage.topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">No topics planned for this subject/grade/year.</p>
      ) : (
        coverage && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${coverage.completion_percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium">{coverage.completion_percentage}%</span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seq</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Planned by</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coverage.topics.map((topic) => (
                  <TableRow key={topic.topic_id}>
                    <TableCell>{topic.sequence}</TableCell>
                    <TableCell className="font-medium">{topic.title}</TableCell>
                    <TableCell>{topic.planned_completion_date ?? "—"}</TableCell>
                    <TableCell>
                      <Select
                        value={topic.status}
                        onValueChange={(value) =>
                          updateProgress.mutate({
                            topicId: topic.topic_id,
                            input: { section_id: sectionId, status: value as ProgressStatus },
                          })
                        }
                      >
                        <SelectTrigger className="w-40 capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROGRESS_STATUSES.map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                              {statusLabel(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      )}
    </div>
  )
}
