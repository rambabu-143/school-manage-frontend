"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { DataTable } from "@/components/data-table/data-table"
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
import { useCreateEnquiry, useEnquiries, useUpdateEnquiryStatus } from "@/hooks/use-enquiries"
import {
  ENQUIRY_SOURCES,
  ENQUIRY_STATUSES,
  type Enquiry,
  type EnquirySource,
  type EnquiryStatus,
} from "@/types/admissions"

const enquirySchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  student_name: z.string().min(1, "Student name is required").max(200),
  grade_interested: z.string().min(1, "Grade is required").max(50),
  parent_name: z.string().min(1, "Parent name is required").max(200),
  phone: z.string().min(1, "Phone is required").max(20),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  source: z.enum(ENQUIRY_SOURCES as [EnquirySource, ...EnquirySource[]]),
  notes: z.string().max(1000).optional(),
})

type EnquiryValues = z.infer<typeof enquirySchema>

function statusLabel(status: string) {
  return status.replace("_", " ")
}

export function EnquiriesTab() {
  const { data: enquiries, isPending } = useEnquiries()
  const [open, setOpen] = React.useState(false)
  const createEnquiry = useCreateEnquiry()
  const updateStatus = useUpdateEnquiryStatus()

  const form = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      branch_id: "",
      student_name: "",
      grade_interested: "",
      parent_name: "",
      phone: "",
      email: "",
      source: "walk_in",
      notes: "",
    },
  })

  function onSubmit(values: EnquiryValues) {
    createEnquiry.mutate(
      { ...values, email: values.email || null, notes: values.notes || null },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<Enquiry>[] = [
    { accessorKey: "student_name", header: "Student" },
    { accessorKey: "grade_interested", header: "Grade" },
    { accessorKey: "parent_name", header: "Parent" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "source", header: "Source", cell: ({ row }) => statusLabel(row.original.source) },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Select
          value={row.original.status}
          onValueChange={(value) =>
            updateStatus.mutate({ id: row.original.id, status: value as EnquiryStatus })
          }
        >
          <SelectTrigger className="w-36 capitalize" onClick={(e) => e.stopPropagation()}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENQUIRY_STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {statusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              New Enquiry
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Enquiry</SheetTitle>
              <SheetDescription>Log a prospective student&apos;s enquiry.</SheetDescription>
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
                  name="student_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student name</FormLabel>
                      <FormControl>
                        <Input placeholder="Aarav Shah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade_interested"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade interested</FormLabel>
                      <FormControl>
                        <Input placeholder="Grade 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parent_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent name</FormLabel>
                      <FormControl>
                        <Input placeholder="Ravi Shah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ENQUIRY_SOURCES.map((source) => (
                              <SelectItem key={source} value={source} className="capitalize">
                                {statusLabel(source)}
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createEnquiry.isPending}>
                    {createEnquiry.isPending && <Loader2 className="animate-spin" />}
                    Create enquiry
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={enquiries ?? []}
        isLoading={isPending}
        emptyMessage="No enquiries yet."
      />
    </div>
  )
}
