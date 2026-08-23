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
import {
  useEnrollApplication,
  useRejectApplication,
  useUpdateApplicationStatus,
} from "@/hooks/use-applications"
import type { AdmissionApplication } from "@/types/admissions"

function statusVariant(status: AdmissionApplication["status"]) {
  if (status === "enrolled") return "default" as const
  if (status === "rejected") return "destructive" as const
  return "secondary" as const
}

interface ApplicationDetailSheetProps {
  application: AdmissionApplication | null
  onOpenChange: (open: boolean) => void
}

export function ApplicationDetailSheet({
  application,
  onOpenChange,
}: ApplicationDetailSheetProps) {
  const [rejectionReason, setRejectionReason] = React.useState("")
  const [admissionNumber, setAdmissionNumber] = React.useState("")

  const updateStatus = useUpdateApplicationStatus()
  const rejectApplication = useRejectApplication()
  const enrollApplication = useEnrollApplication()

  if (!application) return null

  const isOpen = !["rejected", "enrolled"].includes(application.status)

  return (
    <Sheet open={!!application} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {application.applicant_first_name} {application.applicant_last_name}
          </SheetTitle>
          <SheetDescription>
            Guardian: {application.guardian_name} &middot; {application.guardian_phone}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div>
            <Badge variant={statusVariant(application.status)} className="capitalize">
              {application.status.replace("_", " ")}
            </Badge>
            {application.rejection_reason && (
              <p className="mt-2 text-sm text-muted-foreground">
                Reason: {application.rejection_reason}
              </p>
            )}
          </div>

          {isOpen && (
            <>
              <Separator />
              <div className="flex flex-col gap-4">
                {application.status === "submitted" && (
                  <Button
                    disabled={updateStatus.isPending}
                    onClick={() =>
                      updateStatus.mutate({ id: application.id, status: "under_review" })
                    }
                  >
                    {updateStatus.isPending && <Loader2 className="animate-spin" />}
                    Move to under review
                  </Button>
                )}

                {application.status === "under_review" && (
                  <Button
                    disabled={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: application.id, status: "approved" })}
                  >
                    {updateStatus.isPending && <Loader2 className="animate-spin" />}
                    Approve
                  </Button>
                )}

                {application.status === "approved" && (
                  <div className="flex flex-col gap-2">
                    <Label>Admission number</Label>
                    <div className="flex gap-2">
                      <Input
                        value={admissionNumber}
                        placeholder="AN-0002"
                        onChange={(e) => setAdmissionNumber(e.target.value)}
                      />
                      <Button
                        disabled={!admissionNumber || enrollApplication.isPending}
                        onClick={() =>
                          enrollApplication.mutate({
                            id: application.id,
                            admissionNumber,
                          })
                        }
                      >
                        {enrollApplication.isPending && <Loader2 className="animate-spin" />}
                        Enroll
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />
                <div className="flex flex-col gap-2">
                  <Label>Reject application</Label>
                  <Input
                    value={rejectionReason}
                    placeholder="Reason"
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <Button
                    variant="destructive"
                    disabled={!rejectionReason || rejectApplication.isPending}
                    onClick={() =>
                      rejectApplication.mutate({ id: application.id, reason: rejectionReason })
                    }
                  >
                    {rejectApplication.isPending && <Loader2 className="animate-spin" />}
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
