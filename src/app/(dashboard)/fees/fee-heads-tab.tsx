"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { DataTable } from "@/components/data-table/data-table"
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
import { Switch } from "@/components/ui/switch"
import { useCreateFeeHead, useFeeHeads } from "@/hooks/use-fee-heads"
import type { FeeHead } from "@/types/fees"

const feeHeadSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  name: z.string().min(1, "Name is required").max(100),
  is_refundable: z.boolean(),
})

type FeeHeadValues = z.infer<typeof feeHeadSchema>

const columns: ColumnDef<FeeHead>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "is_refundable",
    header: "Refundable",
    cell: ({ row }) =>
      row.original.is_refundable ? (
        <Badge variant="secondary">Refundable</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
]

export function FeeHeadsTab() {
  const { data: feeHeads, isPending } = useFeeHeads()
  const [open, setOpen] = React.useState(false)
  const createFeeHead = useCreateFeeHead()

  const form = useForm<FeeHeadValues>({
    resolver: zodResolver(feeHeadSchema),
    defaultValues: { branch_id: "", name: "", is_refundable: false },
  })

  function onSubmit(values: FeeHeadValues) {
    createFeeHead.mutate(values, {
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
              New Fee Head
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Fee Head</SheetTitle>
              <SheetDescription>e.g. &quot;Tuition Fee&quot;</SheetDescription>
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
                        <Input placeholder="Tuition Fee" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_refundable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                      <FormLabel className="cursor-pointer">Refundable</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createFeeHead.isPending}>
                    {createFeeHead.isPending && <Loader2 className="animate-spin" />}
                    Create fee head
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={feeHeads ?? []}
        isLoading={isPending}
        emptyMessage="No fee heads yet."
      />
    </div>
  )
}
