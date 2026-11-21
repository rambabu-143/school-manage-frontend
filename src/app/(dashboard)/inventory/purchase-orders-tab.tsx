"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus, Upload } from "lucide-react"
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
  useExtractBill,
  usePurchaseOrders,
  useUpdatePurchaseOrderStatus,
} from "@/hooks/use-purchase-orders"
import { ProductSelect } from "@/components/product-select"
import { MAX_PO_ITEMS, buildPoPayload, itemsTotal, validatePo, type PoItemDraft } from "@/lib/purchase-orders"
import { useVendors } from "@/hooks/use-vendors"
import {
  PURCHASE_ORDER_STATUSES,
  type BillExtractResult,
  type PurchaseOrder,
  type PurchaseOrderStatus,
} from "@/types/inventory"

const orderSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  vendor_id: z.string().min(1, "Vendor is required"),
  description: z.string().min(1, "Description is required").max(1000),
  // blank = derived from priced items by the backend
  amount: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().positive("Amount must be greater than 0").optional()),
})

type OrderInput = z.input<typeof orderSchema>
type OrderValues = z.output<typeof orderSchema>

export function PurchaseOrdersTab() {
  const { data: orders, isPending } = usePurchaseOrders()
  const { data: vendors } = useVendors()
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<PoItemDraft[]>([])
  const [itemsError, setItemsError] = React.useState<string | null>(null)
  const [extracted, setExtracted] = React.useState<BillExtractResult | null>(null)
  const createOrder = useCreatePurchaseOrder()
  const updateStatus = useUpdatePurchaseOrderStatus()
  const extractBill = useExtractBill()

  const form = useForm<OrderInput, unknown, OrderValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { branch_id: "", vendor_id: "", description: "", amount: undefined },
  })

  function onSubmit(values: OrderValues) {
    const err = validatePo(values.amount, items)
    setItemsError(err)
    if (err) return
    createOrder.mutate(buildPoPayload(values, items), {
      onSuccess: () => {
        setItems([])
        setOpen(false)
        form.reset()
        setExtracted(null)
      },
    })
  }

  function onBillSelected(file: File | null) {
    if (!file) return
    extractBill.mutate(file, {
      onSuccess: (result) => {
        setExtracted(result)
        const itemSummary = result.items.map((item) => item.name).join(", ")
        const description = [result.vendor_name, itemSummary].filter(Boolean).join(" — ")
        if (description) {
          form.setValue("description", description.slice(0, 1000))
        }
        const total = result.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
        if (total > 0) {
          form.setValue("amount", Math.round(total * 100) / 100)
        }
        // extracted lines carry no product ids: they prefill amount/description only
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
          onValueChange={(value) => {
            if (value === "cancelled" && !window.confirm("Cancel this order? Stock received from it is reversed.")) return
            updateStatus.mutate({ id: row.original.id, status: value as PurchaseOrderStatus })
          }}
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
            if (!next) {
              form.reset()
              setExtracted(null)
              setItems([])
              setItemsError(null)
            }
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
            <div className="flex flex-col gap-2 px-4">
              <label className="text-sm font-medium">Prefill from a bill (optional)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="application/pdf"
                  disabled={extractBill.isPending}
                  onChange={(e) => onBillSelected(e.target.files?.[0] ?? null)}
                  className="h-8 text-xs"
                />
                {extractBill.isPending && <Loader2 className="size-4 animate-spin" />}
                {!extractBill.isPending && <Upload className="size-4 text-muted-foreground" />}
              </div>
              {extracted && (
                <div className="rounded-md border bg-muted/50 p-2 text-xs text-muted-foreground">
                  <p>
                    Read from PDF - review before submitting.
                    {extracted.invoice_no && ` Invoice ${extracted.invoice_no}.`}
                  </p>
                  {extracted.items.length > 0 && (
                    <ul className="mt-1 list-disc pl-4">
                      {extracted.items.map((item, i) => (
                        <li key={i}>
                          {item.name} - {item.quantity} {item.unit} @ {item.rate}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
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
                      <FormLabel>Amount (optional when items have rates)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          value={(field.value as number | undefined) ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Items ({items.length}/{MAX_PO_ITEMS})</span>
                    <Button type="button" variant="outline" size="sm" disabled={items.length >= MAX_PO_ITEMS}
                      onClick={() => setItems((p) => [...p, { product_id: "", quantity: 1, rate: 0 }])}>
                      <Plus /> Add item
                    </Button>
                  </div>
                  {items.map((it, i) => (
                    <div key={i} className="grid grid-cols-[1fr_4rem_5rem_auto] items-center gap-2">
                      <ProductSelect value={it.product_id || undefined} onChange={(v) => setItems((p) => p.map((x, j) => (j === i ? { ...x, product_id: v } : x)))} />
                      <Input type="number" min={1} aria-label="Quantity" value={it.quantity}
                        onChange={(e) => setItems((p) => p.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value) } : x)))} />
                      <Input type="number" min={0} step="0.01" aria-label="Rate" value={it.rate}
                        onChange={(e) => setItems((p) => p.map((x, j) => (j === i ? { ...x, rate: Number(e.target.value) } : x)))} />
                      <Button type="button" variant="ghost" size="sm" aria-label="Remove item" onClick={() => setItems((p) => p.filter((_, j) => j !== i))}>x</Button>
                    </div>
                  ))}
                  {items.length > 0 && <p className="text-xs text-muted-foreground">Items total: {itemsTotal(items)}</p>}
                  {itemsError && <p className="text-sm text-destructive">{itemsError}</p>}
                </div>
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
