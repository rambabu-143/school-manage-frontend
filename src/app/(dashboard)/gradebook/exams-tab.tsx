"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Lock, LockOpen, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AcademicYearSelect } from "@/components/academic-year-select"
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
import { useCreateExam, useExams, useSetExamLocked } from "@/hooks/use-exams"
import type { Exam } from "@/types/gradebook"

const examSchema = z.object({
  academic_year_id: z.string().min(1, "Academic year is required"),
  name: z.string().min(1, "Name is required").max(100),
  weightage: z.coerce.number().int().min(1).max(100),
})

type ExamInput = z.input<typeof examSchema>
type ExamValues = z.output<typeof examSchema>

export function ExamsTab() {
  const { data: exams, isPending } = useExams()
  const [open, setOpen] = React.useState(false)
  const createExam = useCreateExam()
  const setLocked = useSetExamLocked()

  const form = useForm<ExamInput, unknown, ExamValues>({
    resolver: zodResolver(examSchema),
    defaultValues: { academic_year_id: "", name: "", weightage: 100 },
  })

  function onSubmit(values: ExamValues) {
    createExam.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<Exam>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "weightage", header: "Weightage" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_locked ? (
          <Badge variant="secondary">Locked</Badge>
        ) : (
          <span className="text-muted-foreground">Open</span>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={setLocked.isPending}
          onClick={() =>
            setLocked.mutate({ examId: row.original.id, locked: !row.original.is_locked })
          }
        >
          {row.original.is_locked ? <LockOpen /> : <Lock />}
          {row.original.is_locked ? "Unlock" : "Lock"}
        </Button>
      ),
    },
  ]

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
              New Exam
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Exam</SheetTitle>
              <SheetDescription>e.g. &quot;Mid Term&quot;</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                <FormField
                  control={form.control}
                  name="academic_year_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic year</FormLabel>
                      <FormControl>
                        <AcademicYearSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mid Term" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weightage (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          {...field}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createExam.isPending}>
                    {createExam.isPending && <Loader2 className="animate-spin" />}
                    Create exam
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={exams ?? []}
        isLoading={isPending}
        emptyMessage="No exams yet."
      />
    </div>
  )
}
