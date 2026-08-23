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
import { useCreateSection, useSections } from "@/hooks/use-sections"
import type { Section } from "@/types/academics"

import { SectionRosterSheet } from "./section-roster-sheet"

const sectionSchema = z.object({
  grade_id: z.string().min(1, "Grade is required"),
  academic_year_id: z.string().min(1, "Academic year is required"),
  name: z.string().min(1, "Name is required").max(20),
  capacity: z.coerce.number().int().min(1).optional(),
})

type SectionInput = z.input<typeof sectionSchema>
type SectionValues = z.output<typeof sectionSchema>

export function SectionsTab() {
  const { data: sections, isPending } = useSections()
  const { data: grades } = useGrades()
  const { data: years } = useAcademicYears()
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Section | null>(null)
  const createSection = useCreateSection()

  const form = useForm<SectionInput, unknown, SectionValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: { grade_id: "", academic_year_id: "", name: "" },
  })

  function onSubmit(values: SectionValues) {
    createSection.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<Section>[] = React.useMemo(
    () => [
      {
        id: "grade",
        header: "Grade",
        cell: ({ row }) => grades?.find((g) => g.id === row.original.grade_id)?.name ?? "—",
      },
      { accessorKey: "name", header: "Section" },
      {
        id: "year",
        header: "Academic Year",
        cell: ({ row }) =>
          years?.find((y) => y.id === row.original.academic_year_id)?.name ?? "—",
      },
      {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ row }) => row.original.capacity ?? "—",
      },
    ],
    [grades, years]
  )

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
              New Section
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Section</SheetTitle>
              <SheetDescription>e.g. Grade 5, Section &quot;A&quot;</SheetDescription>
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
                      <FormLabel>Section name</FormLabel>
                      <FormControl>
                        <Input placeholder="A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Optional"
                          {...field}
                          value={field.value as number | undefined}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createSection.isPending}>
                    {createSection.isPending && <Loader2 className="animate-spin" />}
                    Create section
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={sections ?? []}
        isLoading={isPending}
        onRowClick={setSelected}
        emptyMessage="No sections yet."
      />

      <SectionRosterSheet
        key={selected?.id}
        section={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}
