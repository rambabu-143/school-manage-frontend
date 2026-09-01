"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
import { Textarea } from "@/components/ui/textarea"
import {
  useCloseCounsellingRecord,
  useCounsellingFollowups,
  useCreateCounsellingFollowup,
} from "@/hooks/use-counselling-records"
import type { CounsellingRecord } from "@/types/counselling"
import type { Student } from "@/types/people"

const followupSchema = z.object({
  followup_date: z.string().min(1, "Date is required"),
  notes: z.string().min(1, "Notes are required").max(2000),
  action_items: z.string().max(1000).optional(),
})

type FollowupValues = z.infer<typeof followupSchema>

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
  const { data: followups, isPending: followupsPending } = useCounsellingFollowups(record?.id)
  const createFollowup = useCreateCounsellingFollowup(record?.id)

  const followupForm = useForm<FollowupValues>({
    resolver: zodResolver(followupSchema),
    defaultValues: { followup_date: "", notes: "", action_items: "" },
  })

  if (!record) return null

  function onAddFollowup(values: FollowupValues) {
    createFollowup.mutate(
      { ...values, action_items: values.action_items || undefined },
      { onSuccess: () => followupForm.reset() }
    )
  }

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

          <Separator />

          <div className="flex flex-col gap-3">
            <Label>Follow-ups</Label>
            {followupsPending && (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
            {!followupsPending && followups?.length === 0 && (
              <p className="text-sm text-muted-foreground">No follow-ups logged yet.</p>
            )}
            {followups?.map((followup) => (
              <div key={followup.id} className="rounded-md border p-3 text-sm">
                <div className="text-muted-foreground">{followup.followup_date}</div>
                <p className="mt-1 whitespace-pre-wrap">{followup.notes}</p>
                {followup.action_items && (
                  <p className="mt-1 text-muted-foreground">
                    Action items: {followup.action_items}
                  </p>
                )}
              </div>
            ))}

            <Form {...followupForm}>
              <form
                onSubmit={followupForm.handleSubmit(onAddFollowup)}
                className="flex flex-col gap-3 rounded-md border border-dashed p-3"
              >
                <FormField
                  control={followupForm.control}
                  name="followup_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={followupForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Notes</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={followupForm.control}
                  name="action_items"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Action items (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={createFollowup.isPending}
                >
                  {createFollowup.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                  Log follow-up
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
