"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
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
import { useClubs, useCreateClub } from "@/hooks/use-clubs"
import { useStaff } from "@/hooks/use-staff"
import type { Club } from "@/types/clubs"

const clubSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().max(50).optional(),
  capacity: z.coerce.number().int().gt(0).optional(),
  coordinator_staff_id: z.string().optional(),
})

type ClubInput = z.input<typeof clubSchema>
type ClubValues = z.output<typeof clubSchema>

export function ClubsTab() {
  const { data: clubs, isPending } = useClubs()
  const { data: staff } = useStaff()
  const [open, setOpen] = React.useState(false)
  const createClub = useCreateClub()

  const staffById = new Map(staff?.map((s) => [s.id, s]))

  const form = useForm<ClubInput, unknown, ClubValues>({
    resolver: zodResolver(clubSchema),
    defaultValues: { branch_id: "", name: "", category: "", coordinator_staff_id: "" },
  })

  function onSubmit(values: ClubValues) {
    createClub.mutate(
      {
        ...values,
        category: values.category || undefined,
        coordinator_staff_id: values.coordinator_staff_id || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<Club>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "category", header: "Category", cell: ({ row }) => row.original.category ?? "—" },
    { accessorKey: "capacity", header: "Capacity", cell: ({ row }) => row.original.capacity ?? "—" },
    {
      id: "coordinator",
      header: "Coordinator",
      cell: ({ row }) => {
        const coordinator = staffById.get(row.original.coordinator_staff_id ?? "")
        return coordinator ? `${coordinator.first_name} ${coordinator.last_name}` : "—"
      },
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
              New Club
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Club</SheetTitle>
              <SheetDescription>e.g. &quot;Chess Club&quot;</SheetDescription>
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
                        <Input placeholder="Chess Club" {...field} />
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
                        <Input placeholder="Games" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Optional"
                          {...field}
                          value={field.value as number | undefined ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coordinator_staff_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coordinator</FormLabel>
                      <FormControl>
                        <StaffSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createClub.isPending}>
                    {createClub.isPending && <Loader2 className="animate-spin" />}
                    Create club
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={clubs ?? []}
        isLoading={isPending}
        emptyMessage="No clubs yet."
      />
    </div>
  )
}
