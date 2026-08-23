"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { DataTable } from "@/components/data-table/data-table"
import { FeeHeadSelect } from "@/components/fee-head-select"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCreateInvoice, useInvoices } from "@/hooks/use-invoices"
import { useStudents } from "@/hooks/use-students"
import type { Invoice } from "@/types/fees"

import { InvoiceDetailSheet } from "./invoice-detail-sheet"

const invoiceSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  academic_year_id: z.string().min(1, "Academic year is required"),
  fee_head_id: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  due_date: z.string().min(1, "Due date is required"),
})

type InvoiceInput = z.input<typeof invoiceSchema>
type InvoiceValues = z.output<typeof invoiceSchema>

function statusVariant(status: Invoice["status"]) {
  if (status === "paid") return "default" as const
  if (status === "overdue") return "destructive" as const
  return "secondary" as const
}

export function InvoicesTab() {
  const { data: invoices, isPending } = useInvoices()
  const { data: students } = useStudents()
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Invoice | null>(null)
  const createInvoice = useCreateInvoice()

  const form = useForm<InvoiceInput, unknown, InvoiceValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { student_id: "", academic_year_id: "", fee_head_id: "", amount: 0, due_date: "" },
  })

  function onSubmit(values: InvoiceValues) {
    createInvoice.mutate(
      { ...values, fee_head_id: values.fee_head_id || null },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = students?.find((s) => s.id === row.original.student_id)
        return student ? `${student.first_name} ${student.last_name}` : "—"
      },
    },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "amount_due", header: "Net payable" },
    { accessorKey: "due_date", header: "Due date" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status)} className="capitalize">
          {row.original.status.replace("_", " ")}
        </Badge>
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
              New Invoice
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Invoice</SheetTitle>
              <SheetDescription>Bill a student for a fee.</SheetDescription>
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
                  name="fee_head_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee head</FormLabel>
                      <FormControl>
                        <FeeHeadSelect value={field.value} onChange={field.onChange} />
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
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createInvoice.isPending}>
                    {createInvoice.isPending && <Loader2 className="animate-spin" />}
                    Create invoice
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={invoices ?? []}
        isLoading={isPending}
        onRowClick={setSelected}
        emptyMessage="No invoices yet."
      />

      <InvoiceDetailSheet
        key={selected?.id}
        invoice={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}
