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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCreateTransportRoute, useTransportRoutes } from "@/hooks/use-transport-routes"
import type { TransportRoute } from "@/types/transport"

import { RouteStudentsSheet } from "./route-students-sheet"

const routeSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  name: z.string().min(1, "Name is required").max(100),
  vehicle_number: z.string().max(20).optional(),
  driver_name: z.string().max(100).optional(),
  driver_phone: z.string().max(20).optional(),
})

type RouteValues = z.infer<typeof routeSchema>

export function RoutesTab() {
  const { data: routes, isPending } = useTransportRoutes()
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<TransportRoute | null>(null)
  const createRoute = useCreateTransportRoute()

  const form = useForm<RouteValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: { branch_id: "", name: "", vehicle_number: "", driver_name: "", driver_phone: "" },
  })

  function onSubmit(values: RouteValues) {
    createRoute.mutate(
      {
        ...values,
        vehicle_number: values.vehicle_number || null,
        driver_name: values.driver_name || null,
        driver_phone: values.driver_phone || null,
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<TransportRoute>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "vehicle_number", header: "Vehicle", cell: ({ row }) => row.original.vehicle_number ?? "—" },
    { accessorKey: "driver_name", header: "Driver", cell: ({ row }) => row.original.driver_name ?? "—" },
    { accessorKey: "driver_phone", header: "Driver phone", cell: ({ row }) => row.original.driver_phone ?? "—" },
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
              New Route
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Route</SheetTitle>
              <SheetDescription>e.g. &quot;Route 1 - North&quot;</SheetDescription>
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
                        <Input placeholder="Route 1 - North" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicle_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle number</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="driver_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver name</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="driver_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createRoute.isPending}>
                    {createRoute.isPending && <Loader2 className="animate-spin" />}
                    Create route
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={routes ?? []}
        isLoading={isPending}
        onRowClick={setSelected}
        emptyMessage="No routes yet."
      />

      <RouteStudentsSheet route={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  )
}
