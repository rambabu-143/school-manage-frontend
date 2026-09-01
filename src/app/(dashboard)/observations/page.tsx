"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DataTable } from "@/components/data-table/data-table"
import { StudentSelect } from "@/components/student-select"
import { SubjectSelect } from "@/components/subject-select"
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
import { useCreateObservationRemark, useObservationRemarks } from "@/hooks/use-observation-remarks"
import { useStudents } from "@/hooks/use-students"
import { useSubjects } from "@/hooks/use-subjects"
import type { ObservationRemark } from "@/types/observations"

const remarkSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  subject_id: z.string().optional(),
  term: z.string().min(1, "Term is required").max(50),
  remark: z.string().min(1, "Remark is required").max(1000),
})

type RemarkValues = z.infer<typeof remarkSchema>

export default function ObservationsPage() {
  const { data: remarks, isPending } = useObservationRemarks()
  const { data: students } = useStudents()
  const { data: subjects } = useSubjects()
  const [open, setOpen] = React.useState(false)
  const createRemark = useCreateObservationRemark()

  const studentById = new Map(students?.map((s) => [s.id, s]))
  const subjectById = new Map(subjects?.map((s) => [s.id, s]))

  const form = useForm<RemarkValues>({
    resolver: zodResolver(remarkSchema),
    defaultValues: { student_id: "", subject_id: "", term: "", remark: "" },
  })

  function onSubmit(values: RemarkValues) {
    createRemark.mutate(
      { ...values, subject_id: values.subject_id || undefined },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<ObservationRemark>[] = [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = studentById.get(row.original.student_id)
        return student ? `${student.first_name} ${student.last_name}` : "—"
      },
    },
    { accessorKey: "term", header: "Term" },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => subjectById.get(row.original.subject_id ?? "")?.name ?? "General",
    },
    { accessorKey: "remark", header: "Remark" },
    { accessorKey: "created_at", header: "Date" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Observation Remarks</h1>
          <p className="text-sm text-muted-foreground">
            A running log of teacher commentary on students, per term.
          </p>
        </div>

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
              New Remark
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Remark</SheetTitle>
              <SheetDescription>Log an observation for a student.</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                <FormField
                  control={form.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student</FormLabel>
                      <FormControl>
                        <StudentSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <SubjectSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term</FormLabel>
                      <FormControl>
                        <Input placeholder="Term 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remark</FormLabel>
                      <FormControl>
                        <Input placeholder="Participates actively in class" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createRemark.isPending}>
                    {createRemark.isPending && <Loader2 className="animate-spin" />}
                    Add remark
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={remarks ?? []}
        isLoading={isPending}
        emptyMessage="No remarks logged yet."
      />
    </div>
  )
}
