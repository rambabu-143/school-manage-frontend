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
import { useCreateHostel, useHostels } from "@/hooks/use-hostels"
import type { Hostel } from "@/types/hostel"

const hostelSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  name: z.string().min(1, "Name is required").max(100),
  warden_name: z.string().max(100).optional(),
  warden_phone: z.string().max(20).optional(),
})

type HostelValues = z.infer<typeof hostelSchema>

const columns: ColumnDef<Hostel>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "warden_name", header: "Warden", cell: ({ row }) => row.original.warden_name ?? "—" },
  { accessorKey: "warden_phone", header: "Warden phone", cell: ({ row }) => row.original.warden_phone ?? "—" },
]

export function HostelsTab() {
  const { data: hostels, isPending } = useHostels()
  const [open, setOpen] = React.useState(false)
  const createHostel = useCreateHostel()

  const form = useForm<HostelValues>({
    resolver: zodResolver(hostelSchema),
    defaultValues: { branch_id: "", name: "", warden_name: "", warden_phone: "" },
  })

  function onSubmit(values: HostelValues) {
    createHostel.mutate(
      { ...values, warden_name: values.warden_name || null, warden_phone: values.warden_phone || null },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
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
              New Hostel
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Hostel</SheetTitle>
              <SheetDescription>e.g. &quot;Boys Hostel A&quot;</SheetDescription>
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
                        <Input placeholder="Boys Hostel A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="warden_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warden name</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="warden_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warden phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createHostel.isPending}>
                    {createHostel.isPending && <Loader2 className="animate-spin" />}
                    Create hostel
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={hostels ?? []}
        isLoading={isPending}
        emptyMessage="No hostels yet."
      />
    </div>
  )
}
