"use client"

import * as React from "react"
import { Loader2, Plus } from "lucide-react"

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
import { useAddNominationReview, useNominationReviews } from "@/hooks/use-self-nominations"
import type { SelfNomination } from "@/types/selfnomination"
import type { Student } from "@/types/people"

interface NominationDetailSheetProps {
  nomination: SelfNomination | null
  student: Student | undefined
  onOpenChange: (open: boolean) => void
}

export function NominationDetailSheet({
  nomination,
  student,
  onOpenChange,
}: NominationDetailSheetProps) {
  const { data: reviews } = useNominationReviews(nomination?.id)
  const addReview = useAddNominationReview(nomination?.id ?? "")
  const [points, setPoints] = React.useState("")
  const [remark, setRemark] = React.useState("")

  if (!nomination) return null

  return (
    <Sheet open={!!nomination} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{student ? `${student.first_name} ${student.last_name}` : "Nomination"}</SheetTitle>
          <SheetDescription className="capitalize">{nomination.form_type} prefect application</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <p className="text-sm">{nomination.statement}</p>

          <Separator />

          <div>
            <span className="text-sm font-medium">Reviews</span>
            <div className="mt-2 flex flex-col gap-2">
              {(!reviews || reviews.length === 0) && (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              )}
              {reviews?.map((review) => (
                <div key={review.id} className="rounded-md border p-2 text-sm">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{review.points}/10</Badge>
                  </div>
                  {review.remark && <p className="mt-1 text-muted-foreground">{review.remark}</p>}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <Label>Add your review</Label>
            <Input
              type="number"
              min={0}
              max={10}
              placeholder="Points (0-10)"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
            <Input
              placeholder="Remark (optional)"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            <Button
              disabled={!points || addReview.isPending}
              onClick={() => {
                addReview.mutate(
                  { points: Number(points), remark: remark || undefined },
                  { onSuccess: () => { setPoints(""); setRemark("") } }
                )
              }}
            >
              {addReview.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
              Submit review
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
