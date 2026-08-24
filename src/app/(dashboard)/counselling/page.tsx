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
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCounsellingRecords, useCreateCounsellingRecord } from "@/hooks/use-counselling-records"
import { useSession } from "@/hooks/use-session"
import { useStudents } from "@/hooks/use-students"
import { ADMIN_ROLES } from "@/types/auth"
import type { CounsellingRecord } from "@/types/counselling"

import { RecordDetailSheet } from "./record-detail-sheet"

const recordSchema = z
  .object({
    student_id: z.string().min(1, "Student is required"),
    session_date: z.string().min(1, "Session date is required"),
    category: z.string().min(1, "Category is required").max(100),
    notes: z.string().min(1, "Notes are required").max(2000),
    follow_up_required: z.boolean(),
    follow_up_date: z.string().optional(),
  })
  .refine((values) => !values.follow_up_required || !!values.follow_up_date, {
    message: "Follow-up date is required when follow-up is needed",
    path: ["follow_up_date"],
  })

type RecordValues = z.infer<typeof recordSchema>

export default function CounsellingPage() {
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)

  const { data: records, isPending } = useCounsellingRecords()
  const { data: students } = useStudents()
  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string>()
  const createRecord = useCreateCounsellingRecord()

  const selected = records?.find((r) => r.id === selectedId) ?? null
  const studentById = new Map(students?.map((s) => [s.id, s]))

  const form = useForm<RecordValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      student_id: "",
      session_date: "",
      category: "",
      notes: "",
      follow_up_required: false,
      follow_up_date: "",
    },
  })

  function onSubmit(values: RecordValues) {
    createRecord.mutate(
      { ...values, follow_up_date: values.follow_up_date || null },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<CounsellingRecord>[] = [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = studentById.get(row.original.student_id)
        return student ? `${student.first_name} ${student.last_name}` : "—"
      },
    },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "session_date", header: "Date" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "closed" ? "default" : "secondary"} className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Counselling</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "All counselling session records."
              : "Your own counselling session records."}
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
              New Session
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Counselling Session</SheetTitle>
              <SheetDescription>Log a session record.</SheetDescription>
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
                  name="session_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session date</FormLabel>
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
                        <Input placeholder="e.g. Academic stress" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Session notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="follow_up_required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                      <FormLabel className="cursor-pointer">Follow-up required</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {form.watch("follow_up_required") && (
                  <FormField
                    control={form.control}
                    name="follow_up_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-up date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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
        emptyMessage="No counselling records yet."
      />

      <RecordDetailSheet
        key={selectedId}
        record={selected}
        student={selected ? studentById.get(selected.student_id) : undefined}
        canClose={isAdmin || selected?.counsellor_id === user?.id}
        onOpenChange={(open) => !open && setSelectedId(undefined)}
      />
    </div>
  )
}
