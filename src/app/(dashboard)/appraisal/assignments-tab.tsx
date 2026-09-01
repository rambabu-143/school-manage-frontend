"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AppraisalCycleSelect } from "@/components/appraisal-cycle-select"
import { DataTable } from "@/components/data-table/data-table"
import { StaffSelect } from "@/components/staff-select"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  useAppraisalAssignments,
  useCreateAppraisalAssignment,
} from "@/hooks/use-appraisal-assignments"
import { useAppraisalCycles } from "@/hooks/use-appraisal-cycles"
import { useSession } from "@/hooks/use-session"
import { useStaff } from "@/hooks/use-staff"
import { ADMIN_ROLES } from "@/types/auth"
import type { AppraisalAssignment } from "@/types/appraisal"

const assignmentSchema = z.object({
  cycle_id: z.string().min(1, "Cycle is required"),
  staff_id: z.string().min(1, "Staff member is required"),
  assessor_staff_id: z.string().min(1, "Assessor is required"),
})

type AssignmentValues = z.infer<typeof assignmentSchema>

export function AssignmentsTab() {
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)

  const { data: assignments, isPending } = useAppraisalAssignments()
  const { data: staff } = useStaff()
  const { data: cycles } = useAppraisalCycles()
  const [open, setOpen] = React.useState(false)
  const createAssignment = useCreateAppraisalAssignment()

  const staffById = new Map(staff?.map((s) => [s.id, s]))
  const cycleById = new Map(cycles?.map((c) => [c.id, c]))

  const form = useForm<AssignmentValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { cycle_id: "", staff_id: "", assessor_staff_id: "" },
  })

  function onSubmit(values: AssignmentValues) {
    createAssignment.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<AppraisalAssignment>[] = [
    {
      id: "cycle",
      header: "Cycle",
      cell: ({ row }) => cycleById.get(row.original.cycle_id)?.name ?? "—",
    },
    {
      id: "staff",
      header: "Staff member",
      cell: ({ row }) => {
        const member = staffById.get(row.original.staff_id)
        return member ? `${member.first_name} ${member.last_name}` : "—"
      },
    },
    {
      id: "assessor",
      header: "Assessor",
      cell: ({ row }) => {
        const assessor = staffById.get(row.original.assessor_staff_id)
        return assessor ? `${assessor.first_name} ${assessor.last_name}` : "—"
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
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
              Assign Assessor
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Assign Assessor</SheetTitle>
              <SheetDescription>
                Decide who writes a staff member&apos;s appraisal for a cycle, ahead of time.
              </SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                <FormField
                  control={form.control}
                  name="cycle_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle</FormLabel>
                      <FormControl>
                        <AppraisalCycleSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="assessor_staff_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessor</FormLabel>
                      <FormControl>
                        <StaffSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createAssignment.isPending}>
                    {createAssignment.isPending && <Loader2 className="animate-spin" />}
                    Assign
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>
      )}

      <DataTable
        columns={columns}
        data={assignments ?? []}
        isLoading={isPending}
        emptyMessage="No assessors assigned yet."
      />
    </div>
  )
}
