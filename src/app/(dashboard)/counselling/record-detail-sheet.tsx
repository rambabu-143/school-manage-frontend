"use client"

import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCloseCounsellingRecord } from "@/hooks/use-counselling-records"
import type { CounsellingRecord } from "@/types/counselling"
import type { Student } from "@/types/people"

interface RecordDetailSheetProps {
  record: CounsellingRecord | null
  student: Student | undefined
  canClose: boolean
  onOpenChange: (open: boolean) => void
}

export function RecordDetailSheet({
  record,
  student,
  canClose,
  onOpenChange,
}: RecordDetailSheetProps) {
  const close = useCloseCounsellingRecord()

  if (!record) return null

  return (
    <Sheet open={!!record} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{student ? `${student.first_name} ${student.last_name}` : "Session"}</SheetTitle>
          <SheetDescription>
            {record.category} &middot; {record.session_date}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div>
            <Badge variant={record.status === "closed" ? "default" : "secondary"} className="capitalize">
              {record.status}
            </Badge>
            <p className="mt-2 text-sm whitespace-pre-wrap">{record.notes}</p>
            {record.follow_up_required && (
              <p className="mt-2 text-sm text-muted-foreground">
                Follow-up required{record.follow_up_date ? ` by ${record.follow_up_date}` : ""}
              </p>
            )}
          </div>

          {canClose && record.status === "open" && (
            <>
              <Separator />
              <Button disabled={close.isPending} onClick={() => close.mutate(record.id)}>
                {close.isPending && <Loader2 className="animate-spin" />}
                Close session
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
