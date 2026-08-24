"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DataTable } from "@/components/data-table/data-table"
import { StudentSelect } from "@/components/student-select"
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
import { useAlumni, useCreateAlumni } from "@/hooks/use-alumni"
import { useStudents } from "@/hooks/use-students"
import type { Alumni } from "@/types/alumni"

import { AlumniEditSheet } from "./alumni-edit-sheet"

const alumniSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  graduation_year: z.coerce.number().int().min(1901).max(2199),
  current_institution: z.string().max(200).optional(),
  occupation: z.string().max(200).optional(),
  employer: z.string().max(200).optional(),
  contact_email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  contact_phone: z.string().max(20).optional(),
})

type AlumniInput = z.input<typeof alumniSchema>
type AlumniValues = z.output<typeof alumniSchema>

export default function AlumniPage() {
  const { data: alumni, isPending } = useAlumni()
  const { data: students } = useStudents()
  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string>()
  const createAlumni = useCreateAlumni()

  const selected = alumni?.find((a) => a.id === selectedId) ?? null
  const studentById = new Map(students?.map((s) => [s.id, s]))
  const alreadyAlumniIds = alumni?.map((a) => a.student_id) ?? []

  const form = useForm<AlumniInput, unknown, AlumniValues>({
    resolver: zodResolver(alumniSchema),
    defaultValues: {
      student_id: "",
      graduation_year: new Date().getFullYear(),
      current_institution: "",
      occupation: "",
      employer: "",
      contact_email: "",
      contact_phone: "",
    },
  })

  function onSubmit(values: AlumniValues) {
    createAlumni.mutate(
      { ...values, contact_email: values.contact_email || null },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<Alumni>[] = [
    {
      id: "student",
      header: "Name",
      cell: ({ row }) => {
        const student = studentById.get(row.original.student_id)
        return student ? `${student.first_name} ${student.last_name}` : "—"
      },
    },
    { accessorKey: "graduation_year", header: "Class of" },
    { accessorKey: "occupation", header: "Occupation", cell: ({ row }) => row.original.occupation ?? "—" },
    { accessorKey: "employer", header: "Employer", cell: ({ row }) => row.original.employer ?? "—" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Alumni</h1>
          <p className="text-sm text-muted-foreground">
            Former students. Graduating a student marks their enrollment inactive.
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
              Graduate a Student
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Graduate a Student</SheetTitle>
              <SheetDescription>Record them as alumni.</SheetDescription>
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
                        <StudentSelect
                          value={field.value}
                          onChange={field.onChange}
                          excludeIds={alreadyAlumniIds}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="graduation_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                  name="current_institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current institution</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createAlumni.isPending}>
                    {createAlumni.isPending && <Loader2 className="animate-spin" />}
                    Create alumni record
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={alumni ?? []}
        isLoading={isPending}
        onRowClick={(row) => setSelectedId(row.id)}
        emptyMessage="No alumni yet."
      />

      <AlumniEditSheet
        key={selectedId}
        alumni={selected}
        student={selected ? studentById.get(selected.student_id) : undefined}
        onOpenChange={(open) => !open && setSelectedId(undefined)}
      />
    </div>
  )
}
