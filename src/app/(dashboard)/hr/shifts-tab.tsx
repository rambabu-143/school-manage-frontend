"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { StaffSelect } from "@/components/staff-select"
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
import { useAssignStaffShift, useCreateShift, useShifts } from "@/hooks/use-shifts"
import type { Shift } from "@/types/hr"

const shiftSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  name: z.string().min(1, "Name is required").max(100),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  grace_minutes: z.coerce.number().int().min(0).max(180),
  half_day_hours: z.coerce.number().positive(),
})

type ShiftInput = z.input<typeof shiftSchema>
type ShiftValues = z.output<typeof shiftSchema>

const columns: ColumnDef<Shift>[] = [
  { accessorKey: "name", header: "Shift" },
  {
    id: "hours",
    header: "Hours",
    cell: ({ row }) => `${row.original.start_time.slice(0, 5)} – ${row.original.end_time.slice(0, 5)}`,
  },
  { accessorKey: "grace_minutes", header: "Grace (min)" },
  { accessorKey: "half_day_hours", header: "Half-day threshold (hrs)" },
]

export function ShiftsTab() {
  const { data: shifts, isPending } = useShifts()
  const [open, setOpen] = React.useState(false)
  const createShift = useCreateShift()
  const assignShift = useAssignStaffShift()

  const [assignStaffId, setAssignStaffId] = React.useState<string>()
  const [assignShiftId, setAssignShiftId] = React.useState<string>()

  const form = useForm<ShiftInput, unknown, ShiftValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      branch_id: "",
      name: "",
      start_time: "09:00",
      end_time: "17:00",
      grace_minutes: 10,
      half_day_hours: 4,
    },
  })

  function onSubmit(values: ShiftValues) {
    createShift.mutate(
      { ...values, half_day_hours: String(values.half_day_hours) },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  function onAssign() {
    if (!assignStaffId || !assignShiftId) return
    assignShift.mutate(
      { staff_id: assignStaffId, shift_id: assignShiftId },
      { onSuccess: () => setAssignStaffId(undefined) }
    )
  }

  return (
    <div className="flex flex-col gap-6">
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
              New Shift
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Shift</SheetTitle>
              <SheetDescription>e.g. &quot;General Shift&quot;</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="General Shift" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="grace_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grace period (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={180} {...field} value={field.value as number} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="half_day_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Half-day threshold (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0.5} step="0.5" {...field} value={field.value as number} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createShift.isPending}>
                    {createShift.isPending && <Loader2 className="animate-spin" />}
                    Create shift
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={shifts ?? []}
        isLoading={isPending}
        emptyMessage="No shifts yet."
      />

      <div className="flex flex-col gap-3 rounded-md border p-4">
        <h2 className="font-medium">Assign a staff member to a shift</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-2">
            <Label>Staff member</Label>
            <StaffSelect value={assignStaffId} onChange={setAssignStaffId} />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label>Shift</Label>
            <Select value={assignShiftId} onValueChange={setAssignShiftId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a shift" />
              </SelectTrigger>
              <SelectContent>
                {shifts?.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onAssign} disabled={!assignStaffId || !assignShiftId || assignShift.isPending}>
            {assignShift.isPending && <Loader2 className="animate-spin" />}
            Assign
          </Button>
        </div>
      </div>
    </div>
  )
}
