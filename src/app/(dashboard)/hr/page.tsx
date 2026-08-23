"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DataTable } from "@/components/data-table/data-table"
import { StaffSelect } from "@/components/staff-select"
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
import { useCreateLeaveApplication, useLeaveApplications } from "@/hooks/use-leave-applications"
import { useSession } from "@/hooks/use-session"
import { useStaff } from "@/hooks/use-staff"
import { ADMIN_ROLES } from "@/types/auth"
import { LEAVE_TYPES, type LeaveApplication, type LeaveType } from "@/types/hr"

import { LeaveDetailSheet } from "./leave-detail-sheet"

const leaveSchema = z.object({
  staff_id: z.string().min(1, "Staff member is required"),
  leave_type: z.enum(LEAVE_TYPES as [LeaveType, ...LeaveType[]]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  reason: z.string().min(1, "Reason is required").max(500),
})

type LeaveValues = z.infer<typeof leaveSchema>

function statusVariant(status: LeaveApplication["status"]) {
  if (status === "approved") return "default" as const
  if (status === "rejected") return "destructive" as const
  return "secondary" as const
}

export default function HrPage() {
  const { data: user } = useSession()
  const { data: staff } = useStaff()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)
  const ownStaffId = staff?.find((s) => s.user_id === user?.id)?.id

  const { data: applications, isPending } = useLeaveApplications()
  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string>()
  const createLeave = useCreateLeaveApplication()

  const selected = applications?.find((a) => a.id === selectedId) ?? null
  const staffById = new Map(staff?.map((s) => [s.id, s]))

  const form = useForm<LeaveValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      staff_id: isAdmin ? "" : (ownStaffId ?? ""),
      leave_type: "casual",
      start_date: "",
      end_date: "",
      reason: "",
    },
  })

  function onSubmit(values: LeaveValues) {
    // Non-admins never see the staff picker, so always resolve their own
    // staff id fresh at submit time rather than trusting the form's
    // mount-time default (which can lock in "" if useStaff was still
    // loading when the form first rendered).
    const staff_id = isAdmin ? values.staff_id : (ownStaffId ?? "")
    createLeave.mutate(
      { ...values, staff_id },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<LeaveApplication>[] = [
    ...(isAdmin
      ? [
          {
            id: "staff",
            header: "Staff",
            cell: ({ row }: { row: { original: LeaveApplication } }) => {
              const member = staffById.get(row.original.staff_id)
              return member ? `${member.first_name} ${member.last_name}` : "—"
            },
          } satisfies ColumnDef<LeaveApplication>,
        ]
      : []),
    { accessorKey: "leave_type", header: "Type", cell: ({ row }) => <span className="capitalize">{row.original.leave_type}</span> },
    { accessorKey: "start_date", header: "From" },
    { accessorKey: "end_date", header: "To" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status)} className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
  ]

  const canApply = isAdmin || !!ownStaffId

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{isAdmin ? "Leave Applications" : "My Leave"}</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Review and act on staff leave requests."
              : "Apply for leave and track your requests."}
          </p>
        </div>

        <Sheet
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (next && !isAdmin) {
              // The trigger is disabled until canApply is true, so ownStaffId
              // is guaranteed resolved here - set it fresh rather than trust
              // the form's mount-time default, which may have captured "" if
              // useStaff was still loading when the form first initialized.
              form.setValue("staff_id", ownStaffId ?? "")
            }
            if (!next) form.reset()
          }}
        >
          <SheetTrigger asChild>
            <Button disabled={!canApply}>
              <Plus />
              Apply for Leave
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Apply for Leave</SheetTitle>
              <SheetDescription>Submit a leave request.</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                {isAdmin && (
                  <FormField
                    control={form.control}
                    name="staff_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff member</FormLabel>
                        <FormControl>
                          <StaffSelect value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="leave_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAVE_TYPES.map((type) => (
                              <SelectItem key={type} value={type} className="capitalize">
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input placeholder="Reason for leave" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createLeave.isPending}>
                    {createLeave.isPending && <Loader2 className="animate-spin" />}
                    Submit
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      {!canApply && (
        <p className="text-sm text-muted-foreground">
          No staff record is linked to your account, so leave can&apos;t be applied for yet.
        </p>
      )}

      <DataTable
        columns={columns}
        data={applications ?? []}
        isLoading={isPending}
        onRowClick={(row) => setSelectedId(row.id)}
        emptyMessage="No leave applications yet."
      />

      <LeaveDetailSheet
        key={selectedId}
        application={selected}
        staff={selected ? staffById.get(selected.staff_id) : undefined}
        canReview={isAdmin}
        onOpenChange={(open) => !open && setSelectedId(undefined)}
      />
    </div>
  )
}
