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
import { useCreateDisciplinaryRecord, useDisciplinaryRecords } from "@/hooks/use-disciplinary-records"
import { useSession } from "@/hooks/use-session"
import { useStudents } from "@/hooks/use-students"
import { ADMIN_ROLES } from "@/types/auth"
import { SEVERITIES, type DisciplinaryRecord, type Severity } from "@/types/disciplinary"

import { RecordDetailSheet } from "./record-detail-sheet"

const recordSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  incident_date: z.string().min(1, "Incident date is required"),
  category: z.string().min(1, "Category is required").max(100),
  severity: z.enum(SEVERITIES as [Severity, ...Severity[]]),
  description: z.string().min(1, "Description is required").max(1000),
})

type RecordValues = z.infer<typeof recordSchema>

function severityVariant(severity: DisciplinaryRecord["severity"]) {
  if (severity === "severe") return "destructive" as const
  if (severity === "major") return "secondary" as const
  return "outline" as const
}

export default function DisciplinaryPage() {
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)

  const { data: records, isPending } = useDisciplinaryRecords()
  const { data: students } = useStudents()
  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string>()
  const createRecord = useCreateDisciplinaryRecord()

  const selected = records?.find((r) => r.id === selectedId) ?? null
  const studentById = new Map(students?.map((s) => [s.id, s]))

  const form = useForm<RecordValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      student_id: "",
      incident_date: "",
      category: "",
      severity: "minor",
      description: "",
    },
  })

  function onSubmit(values: RecordValues) {
    createRecord.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<DisciplinaryRecord>[] = [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = studentById.get(row.original.student_id)
        return student ? `${student.first_name} ${student.last_name}` : "—"
      },
    },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "incident_date", header: "Date" },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => (
        <Badge variant={severityVariant(row.original.severity)} className="capitalize">
          {row.original.severity}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "resolved" ? "default" : "secondary"} className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Disciplinary Records</h1>
          <p className="text-sm text-muted-foreground">
            Log and track student disciplinary incidents.
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
              New Record
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Disciplinary Record</SheetTitle>
              <SheetDescription>Log a student incident.</SheetDescription>
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
                  name="incident_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Tardiness" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SEVERITIES.map((severity) => (
                              <SelectItem key={severity} value={severity} className="capitalize">
                                {severity}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="What happened" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createRecord.isPending}>
                    {createRecord.isPending && <Loader2 className="animate-spin" />}
                    Create record
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={records ?? []}
        isLoading={isPending}
        onRowClick={(row) => setSelectedId(row.id)}
        emptyMessage="No disciplinary records yet."
      />

      <RecordDetailSheet
        key={selectedId}
        record={selected}
        student={selected ? studentById.get(selected.student_id) : undefined}
        canResolve={isAdmin}
        onOpenChange={(open) => !open && setSelectedId(undefined)}
      />
    </div>
  )
}
