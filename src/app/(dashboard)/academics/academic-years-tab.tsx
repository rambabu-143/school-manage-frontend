"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useAcademicYears, useCreateAcademicYear } from "@/hooks/use-academic-years"
import type { AcademicYear } from "@/types/academics"

const yearSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(20),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    is_current: z.boolean(),
  })
  .refine((values) => values.end_date >= values.start_date, {
    message: "End date must be on or after the start date",
    path: ["end_date"],
  })

type YearValues = z.infer<typeof yearSchema>

const columns: ColumnDef<AcademicYear>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "start_date", header: "Start" },
  { accessorKey: "end_date", header: "End" },
  {
    accessorKey: "is_current",
    header: "Status",
    cell: ({ row }) =>
      row.original.is_current ? <Badge>Current</Badge> : <span className="text-muted-foreground">—</span>,
  },
]

export function AcademicYearsTab() {
  const { data: years, isPending } = useAcademicYears()
  const [open, setOpen] = React.useState(false)
  const createYear = useCreateAcademicYear()

  const form = useForm<YearValues>({
    resolver: zodResolver(yearSchema),
    defaultValues: { name: "", start_date: "", end_date: "", is_current: false },
  })

  function onSubmit(values: YearValues) {
    createYear.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
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
              New Academic Year
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Academic Year</SheetTitle>
              <SheetDescription>e.g. &quot;2026-2027&quot;</SheetDescription>
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
                        <Input placeholder="2026-2027" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="is_current"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                      <FormLabel className="cursor-pointer">Mark as current year</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createYear.isPending}>
                    {createYear.isPending && <Loader2 className="animate-spin" />}
                    Create academic year
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={years ?? []}
        isLoading={isPending}
        emptyMessage="No academic years yet."
      />
    </div>
  )
}
