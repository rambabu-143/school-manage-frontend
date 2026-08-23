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
import { useApproveLeaveApplication, useRejectLeaveApplication } from "@/hooks/use-leave-applications"
import type { Staff } from "@/types/people"
import type { LeaveApplication } from "@/types/hr"

function statusVariant(status: LeaveApplication["status"]) {
  if (status === "approved") return "default" as const
  if (status === "rejected") return "destructive" as const
  return "secondary" as const
}

interface LeaveDetailSheetProps {
  application: LeaveApplication | null
  staff: Staff | undefined
  canReview: boolean
  onOpenChange: (open: boolean) => void
}

export function LeaveDetailSheet({
  application,
  staff,
  canReview,
  onOpenChange,
}: LeaveDetailSheetProps) {
  const [comment, setComment] = React.useState("")
  const approve = useApproveLeaveApplication()
  const reject = useRejectLeaveApplication()

  if (!application) return null

  return (
    <Sheet open={!!application} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{staff ? `${staff.first_name} ${staff.last_name}` : "Leave"}</SheetTitle>
          <SheetDescription className="capitalize">
            {application.leave_type} leave &middot; {application.start_date} to{" "}
            {application.end_date}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div>
            <Badge variant={statusVariant(application.status)} className="capitalize">
              {application.status}
            </Badge>
            <p className="mt-2 text-sm">{application.reason}</p>
            {application.review_comment && (
              <p className="mt-2 text-sm text-muted-foreground">
                Review: {application.review_comment}
              </p>
            )}
          </div>

          {canReview && application.status === "pending" && (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <Label>Review comment</Label>
                <Input
                  value={comment}
                  placeholder="Optional"
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={approve.isPending}
                    onClick={() => approve.mutate({ id: application.id, comment })}
                  >
                    {approve.isPending && <Loader2 className="animate-spin" />}
                    Approve
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    disabled={reject.isPending}
                    onClick={() => reject.mutate({ id: application.id, comment })}
                  >
                    {reject.isPending && <Loader2 className="animate-spin" />}
                    Reject
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
