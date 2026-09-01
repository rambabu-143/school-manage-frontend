"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCombos, usePromoteComboStudents } from "@/hooks/use-combos"
import { useStudents } from "@/hooks/use-students"

export function PromoteTab() {
  const { data: combos } = useCombos()
  const { data: students } = useStudents()
  const [sourceComboId, setSourceComboId] = React.useState<string>()
  const [targetComboId, setTargetComboId] = React.useState<string>()
  const [studentIds, setStudentIds] = React.useState<string[]>([])
  const promote = usePromoteComboStudents()

  function onPromote() {
    if (!sourceComboId || !targetComboId || studentIds.length === 0) return
    promote.mutate(
      { comboId: sourceComboId, input: { student_ids: studentIds, target_combo_id: targetComboId } },
      { onSuccess: () => setStudentIds([]) }
    )
  }

  return (
    <div className="flex max-w-md flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Move a batch of students from one combo (e.g. Grade 11 &quot;PCM&quot;) into the matching
        combo for the next year (Grade 12 &quot;PCM&quot;).
      </p>
      <div className="flex flex-col gap-2">
        <Label>From combo</Label>
        <Select value={sourceComboId} onValueChange={setSourceComboId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select the current combo" />
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
      <div className="flex flex-col gap-2">
        <Label>To combo</Label>
        <Select value={targetComboId} onValueChange={setTargetComboId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select the target combo" />
          </SelectTrigger>
          <SelectContent>
            {combos
              ?.filter((c) => c.id !== sourceComboId)
              .map((combo) => (
                <SelectItem key={combo.id} value={combo.id}>
                  {combo.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Students to promote</Label>
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-md border p-3">
          {students?.length === 0 && (
            <p className="text-sm text-muted-foreground">No students yet.</p>
          )}
          {students?.map((student) => (
            <Label key={student.id} className="flex items-center gap-2 font-normal">
              <Checkbox
                checked={studentIds.includes(student.id)}
                onCheckedChange={(checked) => {
                  setStudentIds((prev) =>
                    checked ? [...prev, student.id] : prev.filter((id) => id !== student.id)
                  )
                }}
              />
              {student.first_name} {student.last_name} ({student.admission_number})
            </Label>
          ))}
        </div>
      </div>
      <Button
        onClick={onPromote}
        disabled={!sourceComboId || !targetComboId || studentIds.length === 0 || promote.isPending}
      >
        Promote {studentIds.length || ""} student{studentIds.length === 1 ? "" : "s"}
      </Button>
    </div>
  )
}
