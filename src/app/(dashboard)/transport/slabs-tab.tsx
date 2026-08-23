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
import { useCreateTransportSlab, useTransportSlabs } from "@/hooks/use-transport-slabs"
import type { TransportSlab } from "@/types/transport"

const slabSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  name: z.string().min(1, "Name is required").max(100),
  monthly_fare: z.coerce.number().positive("Fare must be greater than 0"),
})

type SlabInput = z.input<typeof slabSchema>
type SlabValues = z.output<typeof slabSchema>

const columns: ColumnDef<TransportSlab>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "monthly_fare", header: "Monthly fare" },
]

export function SlabsTab() {
  const { data: slabs, isPending } = useTransportSlabs()
  const [open, setOpen] = React.useState(false)
  const createSlab = useCreateTransportSlab()

  const form = useForm<SlabInput, unknown, SlabValues>({
    resolver: zodResolver(slabSchema),
    defaultValues: { branch_id: "", name: "", monthly_fare: 0 },
  })

  function onSubmit(values: SlabValues) {
    createSlab.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

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
              New Fare Slab
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Fare Slab</SheetTitle>
              <SheetDescription>e.g. &quot;0-5 km&quot;</SheetDescription>
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
                        <Input placeholder="0-5 km" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthly_fare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly fare</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createSlab.isPending}>
                    {createSlab.isPending && <Loader2 className="animate-spin" />}
                    Create fare slab
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={slabs ?? []}
        isLoading={isPending}
        emptyMessage="No fare slabs yet."
      />
    </div>
  )
}
