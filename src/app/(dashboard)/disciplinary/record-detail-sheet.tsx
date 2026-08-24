"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useResolveDisciplinaryRecord } from "@/hooks/use-disciplinary-records"
import type { DisciplinaryRecord } from "@/types/disciplinary"
import type { Student } from "@/types/people"

function severityVariant(severity: DisciplinaryRecord["severity"]) {
  if (severity === "severe") return "destructive" as const
  if (severity === "major") return "secondary" as const
  return "outline" as const
}

interface RecordDetailSheetProps {
  record: DisciplinaryRecord | null
  student: Student | undefined
  canResolve: boolean
  onOpenChange: (open: boolean) => void
}

export function RecordDetailSheet({
  record,
  student,
  canResolve,
  onOpenChange,
}: RecordDetailSheetProps) {
  const [actionTaken, setActionTaken] = React.useState("")
  const resolve = useResolveDisciplinaryRecord()

  if (!record) return null

  return (
    <Sheet open={!!record} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{student ? `${student.first_name} ${student.last_name}` : "Record"}</SheetTitle>
          <SheetDescription className="capitalize">
            {record.category} &middot; {record.incident_date}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div>
            <div className="flex gap-2">
              <Badge variant={severityVariant(record.severity)} className="capitalize">
                {record.severity}
              </Badge>
              <Badge variant={record.status === "resolved" ? "default" : "secondary"} className="capitalize">
                {record.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm">{record.description}</p>
            {record.action_taken && (
              <p className="mt-2 text-sm text-muted-foreground">
                Action taken: {record.action_taken}
              </p>
            )}
          </div>

          {canResolve && record.status === "open" && (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <Label>Resolve</Label>
                <Input
                  value={actionTaken}
                  placeholder="Action taken (optional)"
                  onChange={(e) => setActionTaken(e.target.value)}
                />
                <Button
                  disabled={resolve.isPending}
                  onClick={() => resolve.mutate({ id: record.id, actionTaken })}
                >
                  {resolve.isPending && <Loader2 className="animate-spin" />}
                  Mark resolved
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
