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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCreateCertificate, useCertificates } from "@/hooks/use-certificates"
import { useStudents } from "@/hooks/use-students"
import { CERTIFICATE_TYPES, type CertificateRecord } from "@/types/certificates"

const certificateSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  certificate_type: z.enum(CERTIFICATE_TYPES),
  reason: z.string().max(500).optional(),
})

type CertificateValues = z.infer<typeof certificateSchema>

const TYPE_LABELS: Record<string, string> = {
  bonafide: "Bonafide",
  transfer: "Transfer",
  character: "Character",
  study: "Study",
}

export default function CertificatesPage() {
  const [studentFilter, setStudentFilter] = React.useState<string>()
  const { data: certificates, isPending } = useCertificates(studentFilter)
  const { data: students } = useStudents()
  const [open, setOpen] = React.useState(false)
  const createCertificate = useCreateCertificate()

  const studentById = new Map(students?.map((s) => [s.id, s]))

  const form = useForm<CertificateValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: { student_id: "", certificate_type: "bonafide", reason: "" },
  })

  function onSubmit(values: CertificateValues) {
    createCertificate.mutate(
      { ...values, reason: values.reason || undefined },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<CertificateRecord>[] = [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = studentById.get(row.original.student_id)
        return student ? `${student.first_name} ${student.last_name}` : "—"
      },
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => TYPE_LABELS[row.original.certificate_type],
    },
    { accessorKey: "serial_number", header: "Serial No." },
    { accessorKey: "issue_date", header: "Issue date" },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => row.original.reason ?? <span className="text-muted-foreground">—</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Certificates</h1>
          <p className="text-sm text-muted-foreground">
            Issue and track bonafide, transfer, character, and study certificates.
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
              Issue Certificate
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Issue Certificate</SheetTitle>
              <SheetDescription>Record a certificate issuance for a student.</SheetDescription>
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
                  name="certificate_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CERTIFICATE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {TYPE_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Requested for passport application" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createCertificate.isPending}>
                    {createCertificate.isPending && <Loader2 className="animate-spin" />}
                    Issue certificate
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col gap-2 sm:max-w-sm">
        <Label>Filter by student</Label>
        <StudentSelect value={studentFilter} onChange={setStudentFilter} />
      </div>

      <DataTable
        columns={columns}
        data={certificates ?? []}
        isLoading={isPending}
        emptyMessage="No certificates issued yet."
      />
    </div>
  )
}
