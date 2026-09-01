"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { DataTable } from "@/components/data-table/data-table"
import { StaffSelect } from "@/components/staff-select"
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
import { Textarea } from "@/components/ui/textarea"
import { useConcessionRenewals, useUpsertConcessionRenewal } from "@/hooks/use-concession-renewals"
import { useStudents } from "@/hooks/use-students"
import type { ConcessionRenewal } from "@/types/fees"

const renewalSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  academic_year_id: z.string().min(1, "Academic year is required"),
  residential_status: z.string().min(1, "Required").max(50),
  teacher_feedback_parent: z.string().optional(),
  teacher_feedback_student: z.string().optional(),
  annual_income_father: z.coerce.number().min(0).optional(),
  annual_income_mother: z.coerce.number().min(0).optional(),
  income_variation: z.string().max(500).optional(),
  home_visit_report: z.string().optional(),
  home_visit_staff_id: z.string().optional(),
  home_visit_staff2_id: z.string().optional(),
  home_visit_point: z.coerce.number().int().optional(),
  concession_from: z.string().optional(),
  fee_payment_record: z.string().optional(),
  fee_office_remark: z.string().optional(),
  final_remark: z.string().optional(),
})

type RenewalInput = z.input<typeof renewalSchema>
type RenewalValues = z.output<typeof renewalSchema>

export function ConcessionRenewalsTab() {
  const { data: renewals, isPending } = useConcessionRenewals()
  const { data: students } = useStudents()
  const [open, setOpen] = React.useState(false)
  const upsertRenewal = useUpsertConcessionRenewal()

  const form = useForm<RenewalInput, unknown, RenewalValues>({
    resolver: zodResolver(renewalSchema),
    defaultValues: { student_id: "", academic_year_id: "", residential_status: "" },
  })

  function onSubmit(values: RenewalValues) {
    upsertRenewal.mutate(
      {
        ...values,
        teacher_feedback_parent: values.teacher_feedback_parent || null,
        teacher_feedback_student: values.teacher_feedback_student || null,
        annual_income_father:
          values.annual_income_father != null ? String(values.annual_income_father) : null,
        annual_income_mother:
          values.annual_income_mother != null ? String(values.annual_income_mother) : null,
        income_variation: values.income_variation || null,
        home_visit_report: values.home_visit_report || null,
        home_visit_staff_id: values.home_visit_staff_id || null,
        home_visit_staff2_id: values.home_visit_staff2_id || null,
        home_visit_point: values.home_visit_point ?? null,
        concession_from: values.concession_from || null,
        fee_payment_record: values.fee_payment_record || null,
        fee_office_remark: values.fee_office_remark || null,
        final_remark: values.final_remark || null,
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<ConcessionRenewal>[] = [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = students?.find((s) => s.id === row.original.student_id)
        return student ? `${student.first_name} ${student.last_name}` : "—"
      },
    },
    { accessorKey: "residential_status", header: "Residential status" },
    {
      accessorKey: "final_remark",
      header: "Decision",
      cell: ({ row }) =>
        row.original.final_remark ?? (
          <span className="text-muted-foreground">Under review</span>
        ),
    },
    { accessorKey: "updated_at", header: "Last updated" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Financial-aid case per student per year - resubmitting updates the same case.
        </p>
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
              New / Update Case
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Concession Renewal Case</SheetTitle>
              <SheetDescription>
                One case per student per academic year - saving again updates it.
              </SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 overflow-y-auto px-4 pb-4"
              >
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
                  name="residential_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residential status</FormLabel>
                      <FormControl>
                        <Input placeholder="Day scholar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="annual_income_father"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father&apos;s annual income</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step="0.01" {...field} value={field.value as number} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="annual_income_mother"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother&apos;s annual income</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step="0.01" {...field} value={field.value as number} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="income_variation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Income variation from last year</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teacher_feedback_parent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher feedback on parent</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teacher_feedback_student"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher feedback on student</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="home_visit_staff_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home visit staff</FormLabel>
                        <FormControl>
                          <StaffSelect value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="home_visit_staff2_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Co-visiting staff</FormLabel>
                        <FormControl>
                          <StaffSelect value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="home_visit_report"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home visit report</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="home_visit_point"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home visit score</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value as number} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="concession_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concession effective from</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fee_payment_record"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee payment record notes</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fee_office_remark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee office remark</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="final_remark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final decision</FormLabel>
                      <FormControl>
                        <Textarea rows={2} placeholder="e.g. Approved for 20% concession" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={upsertRenewal.isPending}>
                    {upsertRenewal.isPending && <Loader2 className="animate-spin" />}
                    Save case
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={renewals ?? []}
        isLoading={isPending}
        emptyMessage="No concession renewal cases yet."
      />
    </div>
  )
}
