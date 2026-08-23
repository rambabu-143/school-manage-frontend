"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { RouteSelect } from "@/components/route-select"
import { TransportSlabSelect } from "@/components/transport-slab-select"
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
import { useTransportRoutes } from "@/hooks/use-transport-routes"
import { useTransportSlabs } from "@/hooks/use-transport-slabs"
import { useCreateTransportStop, useTransportStops } from "@/hooks/use-transport-stops"
import type { TransportStop } from "@/types/transport"

const stopSchema = z.object({
  route_id: z.string().min(1, "Route is required"),
  slab_id: z.string().min(1, "Fare slab is required"),
  name: z.string().min(1, "Name is required").max(100),
  sequence: z.coerce.number().int().min(1, "Sequence must be at least 1"),
})

type StopInput = z.input<typeof stopSchema>
type StopValues = z.output<typeof stopSchema>

export function StopsTab() {
  const { data: stops, isPending } = useTransportStops()
  const { data: routes } = useTransportRoutes()
  const { data: slabs } = useTransportSlabs()
  const [open, setOpen] = React.useState(false)
  const createStop = useCreateTransportStop()

  const form = useForm<StopInput, unknown, StopValues>({
    resolver: zodResolver(stopSchema),
    defaultValues: { route_id: "", slab_id: "", name: "", sequence: 1 },
  })

  function onSubmit(values: StopValues) {
    createStop.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<TransportStop>[] = [
    {
      id: "route",
      header: "Route",
      cell: ({ row }) => routes?.find((r) => r.id === row.original.route_id)?.name ?? "—",
    },
    { accessorKey: "sequence", header: "Seq" },
    { accessorKey: "name", header: "Stop" },
    {
      id: "slab",
      header: "Fare slab",
      cell: ({ row }) => slabs?.find((s) => s.id === row.original.slab_id)?.name ?? "—",
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
              New Stop
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Stop</SheetTitle>
              <SheetDescription>Add a stop to a route.</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                <FormField
                  control={form.control}
                  name="route_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route</FormLabel>
                      <FormControl>
                        <RouteSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slab_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fare slab</FormLabel>
                      <FormControl>
                        <TransportSlabSelect value={field.value} onChange={field.onChange} />
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
                      <FormLabel>Stop name</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sequence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sequence</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createStop.isPending}>
                    {createStop.isPending && <Loader2 className="animate-spin" />}
                    Create stop
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={stops ?? []}
        isLoading={isPending}
        emptyMessage="No stops yet."
      />
    </div>
  )
}
