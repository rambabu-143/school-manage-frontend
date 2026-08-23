"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { DataTable } from "@/components/data-table/data-table"
import { StudentSelect } from "@/components/student-select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { useConcessions, useCreateConcession, useRevokeConcession } from "@/hooks/use-concessions"
import { useStudents } from "@/hooks/use-students"
import type { Concession } from "@/types/fees"

const concessionSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  academic_year_id: z.string().min(1, "Academic year is required"),
  concession_type: z.string().min(1, "Type is required").max(100),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  reason: z.string().max(500).optional(),
})

type ConcessionInput = z.input<typeof concessionSchema>
type ConcessionValues = z.output<typeof concessionSchema>

export function ConcessionsTab() {
  const { data: concessions, isPending } = useConcessions()
  const { data: students } = useStudents()
  const [open, setOpen] = React.useState(false)
  const createConcession = useCreateConcession()
  const revokeConcession = useRevokeConcession()

  const form = useForm<ConcessionInput, unknown, ConcessionValues>({
    resolver: zodResolver(concessionSchema),
    defaultValues: {
      student_id: "",
      academic_year_id: "",
      concession_type: "",
      amount: 0,
      reason: "",
    },
  })

  function onSubmit(values: ConcessionValues) {
    createConcession.mutate(
      { ...values, reason: values.reason || null },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<Concession>[] = [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = students?.find((s) => s.id === row.original.student_id)
        return student ? `${student.first_name} ${student.last_name}` : "—"
      },
    },
    { accessorKey: "concession_type", header: "Type" },
    { accessorKey: "amount", header: "Amount" },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge>Active</Badge>
        ) : (
          <Badge variant="secondary">Revoked</Badge>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.is_active ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={revokeConcession.isPending}>
                <X />
                Revoke
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke this concession?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deactivates the {row.original.concession_type} concession.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => revokeConcession.mutate(row.original.id)}>
                  Revoke
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null,
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
              New Concession
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Concession</SheetTitle>
              <SheetDescription>e.g. a sibling or merit discount.</SheetDescription>
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
                  name="concession_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Sibling discount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
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
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createConcession.isPending}>
                    {createConcession.isPending && <Loader2 className="animate-spin" />}
                    Create concession
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={concessions ?? []}
        isLoading={isPending}
        emptyMessage="No concessions yet."
      />
    </div>
  )
}
