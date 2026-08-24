"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { DataTable } from "@/components/data-table/data-table"
import { GradeSelect } from "@/components/grade-select"
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
import { useAcademicYears } from "@/hooks/use-academic-years"
import { useGrades } from "@/hooks/use-grades"
import { useSubjects } from "@/hooks/use-subjects"
import { useCreateSyllabusTopic, useSyllabusTopics } from "@/hooks/use-syllabus-topics"
import type { SyllabusTopic } from "@/types/syllabus"

const topicSchema = z.object({
  subject_id: z.string().min(1, "Subject is required"),
  grade_id: z.string().min(1, "Grade is required"),
  academic_year_id: z.string().min(1, "Academic year is required"),
  title: z.string().min(1, "Title is required").max(200),
  sequence: z.coerce.number().int().min(1, "Sequence must be at least 1"),
  planned_completion_date: z.string().optional(),
})

type TopicInput = z.input<typeof topicSchema>
type TopicValues = z.output<typeof topicSchema>

export function TopicsTab() {
  const { data: topics, isPending } = useSyllabusTopics()
  const { data: subjects } = useSubjects()
  const { data: grades } = useGrades()
  const { data: years } = useAcademicYears()
  const [open, setOpen] = React.useState(false)
  const createTopic = useCreateSyllabusTopic()

  const form = useForm<TopicInput, unknown, TopicValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      subject_id: "",
      grade_id: "",
      academic_year_id: "",
      title: "",
      sequence: 1,
      planned_completion_date: "",
    },
  })

  function onSubmit(values: TopicValues) {
    createTopic.mutate(
      { ...values, planned_completion_date: values.planned_completion_date || null },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<SyllabusTopic>[] = [
    { accessorKey: "sequence", header: "Seq" },
    { accessorKey: "title", header: "Title" },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => subjects?.find((s) => s.id === row.original.subject_id)?.name ?? "—",
    },
    {
      id: "grade",
      header: "Grade",
      cell: ({ row }) => grades?.find((g) => g.id === row.original.grade_id)?.name ?? "—",
    },
    {
      id: "year",
      header: "Year",
      cell: ({ row }) => years?.find((y) => y.id === row.original.academic_year_id)?.name ?? "—",
    },
    {
      accessorKey: "planned_completion_date",
      header: "Planned by",
      cell: ({ row }) => row.original.planned_completion_date ?? "—",
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
              New Topic
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Syllabus Topic</SheetTitle>
              <SheetDescription>Plan a topic for a subject/grade/year.</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
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
                  name="grade_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <FormControl>
                        <GradeSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Algebra basics" {...field} />
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
                      <FormLabel>Sequence</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="planned_completion_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned completion date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createTopic.isPending}>
                    {createTopic.isPending && <Loader2 className="animate-spin" />}
                    Create topic
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={topics ?? []}
        isLoading={isPending}
        emptyMessage="No syllabus topics yet."
      />
    </div>
  )
}
