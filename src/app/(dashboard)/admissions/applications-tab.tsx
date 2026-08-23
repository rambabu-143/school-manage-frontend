"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { DataTable } from "@/components/data-table/data-table"
import { GradeSelect } from "@/components/grade-select"
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
import { useApplications, useCreateApplication } from "@/hooks/use-applications"
import type { AdmissionApplication } from "@/types/admissions"

import { ApplicationDetailSheet } from "./application-detail-sheet"

const applicationSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  grade_applying_for_id: z.string().min(1, "Grade is required"),
  applicant_first_name: z.string().min(1, "First name is required").max(100),
  applicant_last_name: z.string().min(1, "Last name is required").max(100),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  guardian_name: z.string().min(1, "Guardian name is required").max(200),
  guardian_phone: z.string().min(1, "Guardian phone is required").max(20),
  guardian_email: z.string().email("Enter a valid email").optional().or(z.literal("")),
})

type ApplicationValues = z.infer<typeof applicationSchema>

function statusVariant(status: AdmissionApplication["status"]) {
  if (status === "enrolled") return "default" as const
  if (status === "rejected") return "destructive" as const
  return "secondary" as const
}

export function ApplicationsTab() {
  const { data: applications, isPending } = useApplications()
  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string>()
  const createApplication = useCreateApplication()
  const selected = applications?.find((a) => a.id === selectedId) ?? null

  const form = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      branch_id: "",
      grade_applying_for_id: "",
      applicant_first_name: "",
      applicant_last_name: "",
      date_of_birth: "",
      guardian_name: "",
      guardian_phone: "",
      guardian_email: "",
    },
  })

  function onSubmit(values: ApplicationValues) {
    createApplication.mutate(
      { ...values, guardian_email: values.guardian_email || null },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<AdmissionApplication>[] = [
    {
      id: "applicant",
      header: "Applicant",
      cell: ({ row }) =>
        `${row.original.applicant_first_name} ${row.original.applicant_last_name}`,
    },
    { accessorKey: "guardian_name", header: "Guardian" },
    { accessorKey: "guardian_phone", header: "Phone" },
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
              New Application
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Application</SheetTitle>
              <SheetDescription>Submit an admission application.</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 overflow-y-auto px-4"
              >
                <FormField
                  control={form.control}
                  name="branch_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <BranchSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade_applying_for_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade applying for</FormLabel>
                      <FormControl>
                        <GradeSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="applicant_first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input placeholder="Aarav" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicant_last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input placeholder="Shah" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guardian_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian name</FormLabel>
                      <FormControl>
                        <Input placeholder="Ravi Shah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guardian_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guardian_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createApplication.isPending}>
                    {createApplication.isPending && <Loader2 className="animate-spin" />}
                    Create application
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={applications ?? []}
        isLoading={isPending}
        onRowClick={(row) => setSelectedId(row.id)}
        emptyMessage="No applications yet."
      />

      <ApplicationDetailSheet
        key={selectedId}
        application={selected}
        onOpenChange={(open) => !open && setSelectedId(undefined)}
      />
    </div>
  )
}
