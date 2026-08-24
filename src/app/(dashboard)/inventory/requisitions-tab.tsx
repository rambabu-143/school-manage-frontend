"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { DataTable } from "@/components/data-table/data-table"
import { ProductSelect } from "@/components/product-select"
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
import { useCreateRequisition, useRequisitions } from "@/hooks/use-requisitions"
import { useProducts } from "@/hooks/use-products"
import { useSession } from "@/hooks/use-session"
import { ADMIN_ROLES } from "@/types/auth"
import type { Requisition } from "@/types/inventory"

import { RequisitionDetailSheet } from "./requisition-detail-sheet"

const requisitionSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  product_id: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
  reason: z.string().min(1, "Reason is required").max(500),
})

type RequisitionInput = z.input<typeof requisitionSchema>
type RequisitionValues = z.output<typeof requisitionSchema>

function statusVariant(status: Requisition["status"]) {
  if (status === "fulfilled" || status === "approved") return "default" as const
  if (status === "rejected") return "destructive" as const
  return "secondary" as const
}

export function RequisitionsTab() {
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)

  const { data: requisitions, isPending } = useRequisitions()
  const { data: products } = useProducts()
  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string>()
  const createRequisition = useCreateRequisition()

  const selected = requisitions?.find((r) => r.id === selectedId) ?? null
  const productById = new Map(products?.map((p) => [p.id, p]))

  const form = useForm<RequisitionInput, unknown, RequisitionValues>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: { branch_id: "", product_id: "", quantity: 1, reason: "" },
  })

  function onSubmit(values: RequisitionValues) {
    createRequisition.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<Requisition>[] = [
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => productById.get(row.original.product_id)?.name ?? "—",
    },
    { accessorKey: "quantity", header: "Qty" },
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
              New Requisition
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Requisition</SheetTitle>
              <SheetDescription>Request supplies.</SheetDescription>
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
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <FormControl>
                        <ProductSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
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
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input placeholder="Running low on supplies" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createRequisition.isPending}>
                    {createRequisition.isPending && <Loader2 className="animate-spin" />}
                    Submit
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={requisitions ?? []}
        isLoading={isPending}
        onRowClick={(row) => setSelectedId(row.id)}
        emptyMessage="No requisitions yet."
      />

      <RequisitionDetailSheet
        key={selectedId}
        requisition={selected}
        product={selected ? productById.get(selected.product_id) : undefined}
        canReview={isAdmin}
        onOpenChange={(open) => !open && setSelectedId(undefined)}
      />
    </div>
  )
}
