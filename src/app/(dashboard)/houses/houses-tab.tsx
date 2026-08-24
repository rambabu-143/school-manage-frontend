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
import { useCreateHouse, useHouses } from "@/hooks/use-houses"
import { useStaff } from "@/hooks/use-staff"
import type { House } from "@/types/houses"

const houseSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  name: z.string().min(1, "Name is required").max(100),
  color: z.string().max(30).optional(),
  captain_staff_id: z.string().optional(),
})

type HouseValues = z.infer<typeof houseSchema>

export function HousesTab() {
  const { data: houses, isPending } = useHouses()
  const { data: staff } = useStaff()
  const [open, setOpen] = React.useState(false)
  const createHouse = useCreateHouse()

  const form = useForm<HouseValues>({
    resolver: zodResolver(houseSchema),
    defaultValues: { branch_id: "", name: "", color: "", captain_staff_id: "" },
  })

  function onSubmit(values: HouseValues) {
    createHouse.mutate(
      { ...values, captain_staff_id: values.captain_staff_id || null },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<House>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.color && (
            <span
              className="size-3 rounded-full border"
              style={{ backgroundColor: row.original.color }}
            />
          )}
          {row.original.name}
        </div>
      ),
    },
    {
      id: "captain",
      header: "Captain",
      cell: ({ row }) => {
        const captain = staff?.find((s) => s.id === row.original.captain_staff_id)
        return captain ? `${captain.first_name} ${captain.last_name}` : "—"
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
              New House
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New House</SheetTitle>
              <SheetDescription>e.g. &quot;Red House&quot;</SheetDescription>
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
                        <Input placeholder="Red House" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input type="color" className="h-10 w-20 p-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="captain_staff_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Captain</FormLabel>
                      <FormControl>
                        <StaffSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createHouse.isPending}>
                    {createHouse.isPending && <Loader2 className="animate-spin" />}
                    Create house
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={houses ?? []}
        isLoading={isPending}
        emptyMessage="No houses yet."
      />
    </div>
  )
}
