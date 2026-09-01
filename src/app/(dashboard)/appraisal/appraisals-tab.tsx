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
import { useAppraisalCycles } from "@/hooks/use-appraisal-cycles"
import { useSession } from "@/hooks/use-session"
import { useCreateStaffAppraisal, useStaffAppraisals } from "@/hooks/use-staff-appraisals"
import { useStaff } from "@/hooks/use-staff"
import { ADMIN_ROLES } from "@/types/auth"
import type { StaffAppraisal } from "@/types/appraisal"

import { AppraisalDetailSheet } from "./appraisal-detail-sheet"

const appraisalSchema = z.object({
  cycle_id: z.string().min(1, "Cycle is required"),
  staff_id: z.string().min(1, "Staff member is required"),
  rating: z.coerce.number().int().min(1).max(5),
  strengths: z.string().max(1000).optional(),
  areas_for_improvement: z.string().max(1000).optional(),
  overall_comments: z.string().max(1000).optional(),
})

type AppraisalInput = z.input<typeof appraisalSchema>
type AppraisalValues = z.output<typeof appraisalSchema>

function statusVariant(status: StaffAppraisal["status"]) {
  if (status === "acknowledged") return "default" as const
  if (status === "submitted") return "secondary" as const
  return "outline" as const
}

export function AppraisalsTab() {
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)

  const { data: appraisals, isPending } = useStaffAppraisals()
  const { data: staff } = useStaff()
  const { data: cycles } = useAppraisalCycles()
  const ownStaffId = staff?.find((s) => s.user_id === user?.id)?.id

  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string>()
  const createAppraisal = useCreateStaffAppraisal()

  const selected = appraisals?.find((a) => a.id === selectedId) ?? null
  const staffById = new Map(staff?.map((s) => [s.id, s]))
  const cycleById = new Map(cycles?.map((c) => [c.id, c]))

  const form = useForm<AppraisalInput, unknown, AppraisalValues>({
    resolver: zodResolver(appraisalSchema),
    defaultValues: {
      cycle_id: "",
      staff_id: "",
      rating: 3,
      strengths: "",
      areas_for_improvement: "",
      overall_comments: "",
    },
  })

  function onSubmit(values: AppraisalValues) {
    createAppraisal.mutate(
      {
        ...values,
        strengths: values.strengths || null,
        areas_for_improvement: values.areas_for_improvement || null,
        overall_comments: values.overall_comments || null,
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<StaffAppraisal>[] = [
    {
      id: "staff",
      header: "Staff",
      cell: ({ row }) => {
        const member = staffById.get(row.original.staff_id)
        return member ? `${member.first_name} ${member.last_name}` : "—"
      },
    },
    {
      id: "cycle",
      header: "Cycle",
      cell: ({ row }) => cycleById.get(row.original.cycle_id)?.name ?? "—",
    },
    { accessorKey: "rating", header: "Rating" },
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
                New Appraisal
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>New Appraisal</SheetTitle>
                <SheetDescription>Review a staff member for a cycle.</SheetDescription>
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
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating (1-5)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={5}
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
                    name="strengths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strengths</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="areas_for_improvement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Areas for improvement</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="overall_comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overall comments</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <SheetFooter className="px-0">
                    <Button type="submit" disabled={createAppraisal.isPending}>
                      {createAppraisal.isPending && <Loader2 className="animate-spin" />}
                      Create appraisal
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
        data={appraisals ?? []}
        isLoading={isPending}
        onRowClick={(row) => setSelectedId(row.id)}
        emptyMessage="No appraisals yet."
      />

      <AppraisalDetailSheet
        key={selectedId}
        appraisal={selected}
        staff={selected ? staffById.get(selected.staff_id) : undefined}
        cycle={selected ? cycleById.get(selected.cycle_id) : undefined}
        canSubmit={isAdmin}
        canAcknowledge={!!selected && selected.staff_id === ownStaffId}
        showRatings={isAdmin}
        onOpenChange={(open) => !open && setSelectedId(undefined)}
      />
    </div>
  )
}
