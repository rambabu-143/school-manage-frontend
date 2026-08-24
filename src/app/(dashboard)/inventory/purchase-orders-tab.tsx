"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { DataTable } from "@/components/data-table/data-table"
import { VendorSelect } from "@/components/vendor-select"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  useCreatePurchaseOrder,
  usePurchaseOrders,
  useUpdatePurchaseOrderStatus,
} from "@/hooks/use-purchase-orders"
import { useVendors } from "@/hooks/use-vendors"
import {
  PURCHASE_ORDER_STATUSES,
  type PurchaseOrder,
  type PurchaseOrderStatus,
} from "@/types/inventory"

const orderSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  vendor_id: z.string().min(1, "Vendor is required"),
  description: z.string().min(1, "Description is required").max(1000),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
})

type OrderInput = z.input<typeof orderSchema>
type OrderValues = z.output<typeof orderSchema>

export function PurchaseOrdersTab() {
  const { data: orders, isPending } = usePurchaseOrders()
  const { data: vendors } = useVendors()
  const [open, setOpen] = React.useState(false)
  const createOrder = useCreatePurchaseOrder()
  const updateStatus = useUpdatePurchaseOrderStatus()

  const form = useForm<OrderInput, unknown, OrderValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { branch_id: "", vendor_id: "", description: "", amount: 0 },
  })

  function onSubmit(values: OrderValues) {
    createOrder.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      id: "vendor",
      header: "Vendor",
      cell: ({ row }) => vendors?.find((v) => v.id === row.original.vendor_id)?.name ?? "—",
    },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "order_date", header: "Order date" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Select
          value={row.original.status}
          onValueChange={(value) =>
            updateStatus.mutate({ id: row.original.id, status: value as PurchaseOrderStatus })
          }
        >
          <SelectTrigger className="w-36 capitalize" onClick={(e) => e.stopPropagation()}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PURCHASE_ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              New Purchase Order
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Purchase Order</SheetTitle>
              <SheetDescription>Order supplies from a vendor.</SheetDescription>
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
                  name="vendor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor</FormLabel>
                      <FormControl>
                        <VendorSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="50 reams of A4 paper" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
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
                  <Button type="submit" disabled={createOrder.isPending}>
                    {createOrder.isPending && <Loader2 className="animate-spin" />}
                    Create purchase order
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={orders ?? []}
        isLoading={isPending}
        emptyMessage="No purchase orders yet."
      />
    </div>
  )
}
