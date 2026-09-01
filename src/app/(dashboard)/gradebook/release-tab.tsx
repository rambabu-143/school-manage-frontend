"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { BranchSelect } from "@/components/branch-select"
import { GradeSelect } from "@/components/grade-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  useReportCardReleaseSetting,
  useUpsertReportCardReleaseSetting,
} from "@/hooks/use-report-card-release"
import type { ReportCardReleaseSetting } from "@/types/gradebook"

interface ReleaseFormProps {
  branchId: string
  academicYearId: string
  gradeId: string
  setting: ReportCardReleaseSetting | undefined
}

function ReleaseForm({ branchId, academicYearId, gradeId, setting }: ReleaseFormProps) {
  const [isLive, setIsLive] = React.useState(setting?.is_live ?? false)
  const [liveAt, setLiveAt] = React.useState(setting?.live_at?.slice(0, 16) ?? "")
  const upsert = useUpsertReportCardReleaseSetting()

  function onSave() {
    upsert.mutate({
      branch_id: branchId,
      academic_year_id: academicYearId,
      grade_id: gradeId,
      is_live: isLive,
      live_at: liveAt ? new Date(liveAt).toISOString() : null,
    })
  }

  return (
    <>
      <div className="flex items-center justify-between rounded-md border p-4">
        <div>
          <p className="font-medium">Report cards live</p>
          <p className="text-sm text-muted-foreground">
            Parents can view report cards for this grade.
          </p>
        </div>
        <Switch checked={isLive} onCheckedChange={setIsLive} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Scheduled release (optional)</Label>
        <Input
          type="datetime-local"
          value={liveAt}
          onChange={(event) => setLiveAt(event.target.value)}
        />
      </div>
      <Button onClick={onSave} disabled={upsert.isPending}>
        Save
      </Button>
    </>
  )
}

export function ReleaseTab() {
  const [branchId, setBranchId] = React.useState<string>()
  const [academicYearId, setAcademicYearId] = React.useState<string>()
  const [gradeId, setGradeId] = React.useState<string>()

  const { data: setting, isPending } = useReportCardReleaseSetting({
    branchId,
    academicYearId,
    gradeId,
  })

  const ready = !!branchId && !!academicYearId && !!gradeId

  return (
    <div className="flex max-w-md flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Control when report cards for a grade become visible for a branch and academic year.
      </p>
      <div className="flex flex-col gap-2">
        <Label>Branch</Label>
        <BranchSelect value={branchId} onChange={setBranchId} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Academic year</Label>
        <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Grade</Label>
        <GradeSelect value={gradeId} onChange={setGradeId} branchId={branchId} />
      </div>

      {ready && !isPending && (
        <ReleaseForm
          key={`${branchId}-${academicYearId}-${gradeId}`}
          branchId={branchId}
          academicYearId={academicYearId}
          gradeId={gradeId}
          setting={setting}
        />
      )}
    </div>
  )
}
