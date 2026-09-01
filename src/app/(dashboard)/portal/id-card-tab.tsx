"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useMyChildIdCard, useRequestIdCardUpdate } from "@/hooks/use-id-cards"

export function IdCardTab({ studentId }: { studentId: string }) {
  const { data: card, isPending } = useMyChildIdCard(studentId)
  const requestUpdate = useRequestIdCardUpdate(studentId)
  const [open, setOpen] = React.useState(false)
  const [notes, setNotes] = React.useState("")

  function onSubmit() {
    if (!notes.trim()) return
    requestUpdate.mutate(
      { notes },
      {
        onSuccess: () => {
          setOpen(false)
          setNotes("")
        },
      }
    )
  }

  if (isPending) return <p className="text-sm text-muted-foreground">Loading...</p>
  if (!card) return null

  return (
    <div className="flex flex-col gap-4">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>
            {card.first_name} {card.last_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <span className="text-muted-foreground">Admission No.</span>
          <span>{card.admission_number}</span>
          <span className="text-muted-foreground">Date of birth</span>
          <span>{card.date_of_birth}</span>
          <span className="text-muted-foreground">Class</span>
          <span>
            {card.grade_name ?? "—"} {card.section_name ?? ""}
          </span>
          <span className="text-muted-foreground">Guardian</span>
          <span>{card.guardian_name ?? "—"}</span>
          <span className="text-muted-foreground">Guardian phone</span>
          <span>{card.guardian_phone ?? "—"}</span>
          <span className="text-muted-foreground">Transport route</span>
          <span>{card.transport_route_name ?? "—"}</span>
          <span className="text-muted-foreground">Transport stop</span>
          <span>{card.transport_stop_name ?? "—"}</span>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="self-start">
            Something wrong? Request a correction
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a correction</DialogTitle>
            <DialogDescription>
              Describe what needs fixing - the school office will review it.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder="e.g. Blood group is wrong, should be O+"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={onSubmit} disabled={!notes.trim() || requestUpdate.isPending}>
              {requestUpdate.isPending && <Loader2 className="animate-spin" />}
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
