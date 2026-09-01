"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { DataTable } from "@/components/data-table/data-table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCreateHoliday, useHolidays } from "@/hooks/use-holidays"
import { useSession } from "@/hooks/use-session"
import { ADMIN_ROLES } from "@/types/auth"
import type { Holiday, HolidayType } from "@/types/holidays"

const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
  national: "National Holiday",
  festival: "Festival",
  summer_break: "Summer Break",
  winter_break: "Winter Break",
  week_off: "Week Off",
}

const holidaySchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  holiday_type: z.enum(
    ["national", "festival", "summer_break", "winter_break", "week_off"],
    { message: "Holiday type is required" }
  ),
  holiday_date: z.string().min(1, "Date is required"),
})

type HolidayValues = z.infer<typeof holidaySchema>

const columns: ColumnDef<Holiday>[] = [
  { accessorKey: "holiday_date", header: "Date" },
  { accessorKey: "title", header: "Title" },
  {
    id: "holiday_type",
    header: "Type",
    cell: ({ row }) => <Badge variant="secondary">{HOLIDAY_TYPE_LABELS[row.original.holiday_type]}</Badge>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description ?? "—",
  },
]

export default function HolidaysPage() {
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)

  const { data: holidays, isPending } = useHolidays()
  const [open, setOpen] = React.useState(false)
  const createHoliday = useCreateHoliday()

  const form = useForm<HolidayValues>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      branch_id: "",
      title: "",
      description: "",
      holiday_type: undefined,
      holiday_date: "",
    },
  })

  function onSubmit(values: HolidayValues) {
    createHoliday.mutate(
      { ...values, description: values.description || undefined },
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Holiday Calendar</h1>
          <p className="text-sm text-muted-foreground">
            {holidays?.length ?? 0} holiday{holidays?.length === 1 ? "" : "s"}
          </p>
        </div>
        {isAdmin && (
          <Sheet
            open={open}
            onOpenChange={(next) => {
              setOpen(next)
              if (!next) form.reset()
            }}
          >
            <SheetTrigger asChild>
              <Button>
                <Plus />
                New Holiday
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>New Holiday</SheetTitle>
                <SheetDescription>Add a day to the branch&apos;s calendar.</SheetDescription>
              </SheetHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                  <FormField
                    control={form.control}
                    name="branch_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <FormControl>
                          <BranchSelect value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Republic Day" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="holiday_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(HOLIDAY_TYPE_LABELS) as HolidayType[]).map((key) => (
                                <SelectItem key={key} value={key}>
                                  {HOLIDAY_TYPE_LABELS[key]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="holiday_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <SheetFooter className="px-0">
                    <Button type="submit" disabled={createHoliday.isPending}>
                      {createHoliday.isPending && <Loader2 className="animate-spin" />}
                      Add holiday
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <DataTable
        columns={columns}
        data={holidays ?? []}
        isLoading={isPending}
        emptyMessage="No holidays added yet."
      />
    </div>
  )
}
