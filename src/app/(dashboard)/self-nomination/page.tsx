"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DataTable } from "@/components/data-table/data-table"
import { StudentSelect } from "@/components/student-select"
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
import { useCreateSelfNomination, useSelfNominations } from "@/hooks/use-self-nominations"
import { useStudents } from "@/hooks/use-students"
import type { SelfNomination } from "@/types/selfnomination"

import { NominationDetailSheet } from "./nomination-detail-sheet"

const nominationSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  form_type: z.enum(["junior", "senior"], { message: "Form type is required" }),
  statement: z.string().min(1, "Statement is required").max(2000),
})

type NominationValues = z.infer<typeof nominationSchema>

export default function SelfNominationPage() {
  const { data: nominations, isPending } = useSelfNominations()
  const { data: students } = useStudents()
  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string>()
  const createNomination = useCreateSelfNomination()

  const studentById = new Map(students?.map((s) => [s.id, s]))
  const selected = nominations?.find((n) => n.id === selectedId) ?? null

  const form = useForm<NominationValues>({
    resolver: zodResolver(nominationSchema),
    defaultValues: { student_id: "", form_type: undefined, statement: "" },
  })

  function onSubmit(values: NominationValues) {
    createNomination.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<SelfNomination>[] = [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = studentById.get(row.original.student_id)
        return student ? `${student.first_name} ${student.last_name}` : "—"
      },
    },
    {
      accessorKey: "form_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.form_type}
        </Badge>
      ),
    },
    { accessorKey: "statement", header: "Statement" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Self-Nominations</h1>
          <p className="text-sm text-muted-foreground">
            Leadership applications, scored by one or more staff reviewers.
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
              New Nomination
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Nomination</SheetTitle>
              <SheetDescription>Record a student&apos;s leadership application.</SheetDescription>
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
                  name="form_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full capitalize">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statement</FormLabel>
                      <FormControl>
                        <Input placeholder="Why should this student be selected?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createNomination.isPending}>
                    {createNomination.isPending && <Loader2 className="animate-spin" />}
                    Create nomination
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={nominations ?? []}
        isLoading={isPending}
        onRowClick={(row) => setSelectedId(row.id)}
        emptyMessage="No nominations yet."
      />

      <NominationDetailSheet
        key={selectedId}
        nomination={selected}
        student={selected ? studentById.get(selected.student_id) : undefined}
        onOpenChange={(open) => !open && setSelectedId(undefined)}
      />
    </div>
  )
}
