"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { StudentSelect } from "@/components/student-select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAssignStudentCombo, useCombos, useStudentCombo } from "@/hooks/use-combos"

interface ComboAssignFormProps {
  studentId: string
  academicYearId: string
}

function ComboAssignForm({ studentId, academicYearId }: ComboAssignFormProps) {
  const { data: combos } = useCombos({ academicYearId })
  const { data: current, isPending: currentPending } = useStudentCombo(studentId, academicYearId)
  const assignCombo = useAssignStudentCombo()
  const [override, setOverride] = React.useState<string>()
  const comboId = override ?? current?.combo_id

  function onAssign() {
    if (!comboId) return
    assignCombo.mutate({ studentId, input: { combo_id: comboId } })
  }

  return (
    <>
      {!currentPending && (
        <p className="text-sm text-muted-foreground">
          {current ? "Currently has a combo assigned." : "No combo assigned yet."}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Label>Combo</Label>
        <Select value={comboId} onValueChange={setOverride} disabled={!combos?.length}>
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={combos?.length ? "Select a combo" : "No combos for this year yet"}
            />
          </SelectTrigger>
          <SelectContent>
            {combos?.map((combo) => (
              <SelectItem key={combo.id} value={combo.id}>
                {combo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onAssign} disabled={!comboId || assignCombo.isPending}>
        Assign combo
      </Button>
    </>
  )
}

export function AssignTab() {
  const [studentId, setStudentId] = React.useState<string>()
  const [academicYearId, setAcademicYearId] = React.useState<string>()

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Student</Label>
        <StudentSelect value={studentId} onChange={setStudentId} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Academic year</Label>
        <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
      </div>

      {studentId && academicYearId ? (
        <ComboAssignForm
          key={`${studentId}-${academicYearId}`}
          studentId={studentId}
          academicYearId={academicYearId}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Select a student and academic year to manage their combo.
        </p>
      )}
    </div>
  )
}
