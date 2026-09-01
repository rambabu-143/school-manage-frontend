"use client"

import { Loader2, Star } from "lucide-react"

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
import { useAcknowledgeStaffAppraisal, useSubmitStaffAppraisal } from "@/hooks/use-staff-appraisals"
import { useStaffRatings } from "@/hooks/use-staff-ratings"
import type { AppraisalCycle, StaffAppraisal } from "@/types/appraisal"
import type { Staff } from "@/types/people"

function statusVariant(status: StaffAppraisal["status"]) {
  if (status === "acknowledged") return "default" as const
  if (status === "submitted") return "secondary" as const
  return "outline" as const
}

interface AppraisalDetailSheetProps {
  appraisal: StaffAppraisal | null
  staff: Staff | undefined
  cycle: AppraisalCycle | undefined
  canSubmit: boolean
  canAcknowledge: boolean
  showRatings: boolean
  onOpenChange: (open: boolean) => void
}

export function AppraisalDetailSheet({
  appraisal,
  staff,
  cycle,
  canSubmit,
  canAcknowledge,
  showRatings,
  onOpenChange,
}: AppraisalDetailSheetProps) {
  const submit = useSubmitStaffAppraisal()
  const acknowledge = useAcknowledgeStaffAppraisal()
  const { data: ratings } = useStaffRatings(
    showRatings ? cycle?.id : undefined,
    showRatings ? appraisal?.staff_id : undefined
  )

  if (!appraisal) return null

  const averageRating =
    ratings && ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : null

  return (
    <Sheet open={!!appraisal} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{staff ? `${staff.first_name} ${staff.last_name}` : "Appraisal"}</SheetTitle>
          <SheetDescription>{cycle?.name ?? "—"}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant(appraisal.status)} className="capitalize">
                {appraisal.status}
              </Badge>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < appraisal.rating
                        ? "size-4 fill-primary text-primary"
                        : "size-4 text-muted-foreground"
                    }
                  />
                ))}
              </div>
            </div>
            {appraisal.strengths && (
              <p className="mt-3 text-sm">
                <span className="font-medium">Strengths: </span>
                {appraisal.strengths}
              </p>
            )}
            {appraisal.areas_for_improvement && (
              <p className="mt-2 text-sm">
                <span className="font-medium">Areas for improvement: </span>
                {appraisal.areas_for_improvement}
              </p>
            )}
            {appraisal.overall_comments && (
              <p className="mt-2 text-sm">
                <span className="font-medium">Overall: </span>
                {appraisal.overall_comments}
              </p>
            )}
          </div>

          {canSubmit && appraisal.status === "draft" && (
            <>
              <Separator />
              <Button disabled={submit.isPending} onClick={() => submit.mutate(appraisal.id)}>
                {submit.isPending && <Loader2 className="animate-spin" />}
                Submit to staff member
              </Button>
            </>
          )}

          {canAcknowledge && appraisal.status === "submitted" && (
            <>
              <Separator />
              <Button
                disabled={acknowledge.isPending}
                onClick={() => acknowledge.mutate(appraisal.id)}
              >
                {acknowledge.isPending && <Loader2 className="animate-spin" />}
                Acknowledge
              </Button>
            </>
          )}

          {showRatings && ratings && ratings.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Peer/student ratings</span>
                  <Badge variant="outline">
                    {averageRating?.toFixed(1)} avg · {ratings.length}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  {ratings.map((r) => (
                    <div key={r.id} className="rounded-md border p-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="capitalize text-muted-foreground">{r.rater_role}</span>
                        <span className="font-medium">{r.rating}/5</span>
                      </div>
                      {r.comment && <p className="mt-1 text-muted-foreground">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
