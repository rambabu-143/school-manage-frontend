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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useCombos, useCreateCombo } from "@/hooks/use-combos"
import { useGrades } from "@/hooks/use-grades"
import { useSubjects } from "@/hooks/use-subjects"
import type { Combo } from "@/types/combo"

const comboSchema = z.object({
  grade_id: z.string().min(1, "Grade is required"),
  academic_year_id: z.string().min(1, "Academic year is required"),
  name: z.string().min(1, "Name is required").max(100),
  subject_ids: z.array(z.string()).min(1, "Select at least one subject"),
})

type ComboValues = z.infer<typeof comboSchema>

export function CombosTab() {
  const { data: combos, isPending } = useCombos()
  const { data: grades } = useGrades()
  const { data: years } = useAcademicYears()
  const { data: subjects } = useSubjects()
  const [open, setOpen] = React.useState(false)
  const createCombo = useCreateCombo()

  const form = useForm<ComboValues>({
    resolver: zodResolver(comboSchema),
    defaultValues: { grade_id: "", academic_year_id: "", name: "", subject_ids: [] },
  })
  const selectedSubjectIds = form.watch("subject_ids")

  function onSubmit(values: ComboValues) {
    createCombo.mutate(
      {
        name: values.name,
        grade_id: values.grade_id,
        academic_year_id: values.academic_year_id,
        subjects: values.subject_ids.map((subject_id) => ({ subject_id })),
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<Combo>[] = [
    { accessorKey: "name", header: "Name" },
    {
      id: "grade",
      header: "Grade",
      cell: ({ row }) => grades?.find((g) => g.id === row.original.grade_id)?.name ?? "—",
    },
    {
      id: "academic_year",
      header: "Academic year",
      cell: ({ row }) => years?.find((y) => y.id === row.original.academic_year_id)?.name ?? "—",
    },
    {
      id: "subjects",
      header: "Subjects",
      cell: ({ row }) =>
        row.original.subjects
          .map((s) => subjects?.find((subj) => subj.id === s.subject_id)?.name ?? "?")
          .join(", "),
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
              New Combo
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Combo</SheetTitle>
              <SheetDescription>e.g. &quot;PCM&quot; for Grade 11</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="PCM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject_ids"
                  render={() => (
                    <FormItem>
                      <FormLabel>Subjects</FormLabel>
                      <div className="flex flex-col gap-2 rounded-md border p-3">
                        {subjects?.length === 0 && (
                          <p className="text-sm text-muted-foreground">No subjects yet.</p>
                        )}
                        {subjects?.map((subject) => (
                          <Label key={subject.id} className="flex items-center gap-2 font-normal">
                            <Checkbox
                              checked={selectedSubjectIds.includes(subject.id)}
                              onCheckedChange={(checked) => {
                                form.setValue(
                                  "subject_ids",
                                  checked
                                    ? [...selectedSubjectIds, subject.id]
                                    : selectedSubjectIds.filter((id) => id !== subject.id),
                                  { shouldValidate: true }
                                )
                              }}
                            />
                            {subject.name} ({subject.code})
                          </Label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createCombo.isPending}>
                    {createCombo.isPending && <Loader2 className="animate-spin" />}
                    Create combo
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={combos ?? []}
        isLoading={isPending}
        emptyMessage="No combos yet."
      />
    </div>
  )
}
