"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DataTable } from "@/components/data-table/data-table"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCcaActivities, useCcaIndicators, useCreateCcaIndicator } from "@/hooks/use-cca"
import type { CcaIndicator } from "@/types/cca"

const indicatorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  sequence: z.coerce.number().int().min(1),
})

type IndicatorInput = z.input<typeof indicatorSchema>
type IndicatorValues = z.output<typeof indicatorSchema>

const columns: ColumnDef<CcaIndicator>[] = [
  { accessorKey: "sequence", header: "#" },
  { accessorKey: "name", header: "Indicator" },
]

export function IndicatorsTab() {
  const { data: activities } = useCcaActivities()
  const [activityId, setActivityId] = React.useState<string>()
  const { data: indicators, isPending } = useCcaIndicators(activityId)
  const [open, setOpen] = React.useState(false)
  const createIndicator = useCreateCcaIndicator()

  const form = useForm<IndicatorInput, unknown, IndicatorValues>({
    resolver: zodResolver(indicatorSchema),
    defaultValues: { name: "", sequence: 1 },
  })

  function onSubmit(values: IndicatorValues) {
    if (!activityId) return
    createIndicator.mutate(
      { activity_id: activityId, ...values },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex max-w-sm flex-1 flex-col gap-2">
          <Label>Activity</Label>
          <Select value={activityId} onValueChange={setActivityId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an activity" />
            </SelectTrigger>
            <SelectContent>
              {activities?.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Sheet
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) form.reset()
          }}
        >
          <SheetTrigger asChild>
            <Button disabled={!activityId}>
              <Plus />
              New Indicator
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Indicator</SheetTitle>
              <SheetDescription>e.g. &quot;Rhythm&quot;, &quot;Team Spirit&quot;</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Rhythm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sequence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display order</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} value={field.value as number} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createIndicator.isPending}>
                    {createIndicator.isPending && <Loader2 className="animate-spin" />}
                    Create indicator
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      {activityId ? (
        <DataTable
          columns={columns}
          data={indicators ?? []}
          isLoading={isPending}
          emptyMessage="No indicators yet."
        />
      ) : (
        <p className="text-sm text-muted-foreground">Select an activity to see its indicators.</p>
      )}
    </div>
  )
}
