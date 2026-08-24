"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { ProductCategorySelect } from "@/components/product-category-select"
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
import { useAssets, useCreateAsset, useUpdateAssetStatus } from "@/hooks/use-assets"
import { useProductCategories } from "@/hooks/use-product-categories"
import { ASSET_STATUSES, type Asset, type AssetStatus } from "@/types/inventory"

const assetSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  category_id: z.string().optional(),
  asset_tag: z.string().min(1, "Asset tag is required").max(50),
  name: z.string().min(1, "Name is required").max(200),
  purchase_date: z.string().min(1, "Purchase date is required"),
  purchase_cost: z.coerce.number().positive("Cost must be greater than 0"),
})

type AssetInput = z.input<typeof assetSchema>
type AssetValues = z.output<typeof assetSchema>

function statusLabel(status: string) {
  return status.replace("_", " ")
}

export function AssetsTab() {
  const { data: assets, isPending } = useAssets()
  const { data: categories } = useProductCategories()
  const [open, setOpen] = React.useState(false)
  const createAsset = useCreateAsset()
  const updateStatus = useUpdateAssetStatus()

  const form = useForm<AssetInput, unknown, AssetValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      branch_id: "",
      category_id: "",
      asset_tag: "",
      name: "",
      purchase_date: "",
      purchase_cost: 0,
    },
  })

  function onSubmit(values: AssetValues) {
    createAsset.mutate(
      { ...values, category_id: values.category_id || null },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<Asset>[] = [
    { accessorKey: "asset_tag", header: "Tag" },
    { accessorKey: "name", header: "Name" },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => categories?.find((c) => c.id === row.original.category_id)?.name ?? "—",
    },
    { accessorKey: "purchase_cost", header: "Cost" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Select
          value={row.original.status}
          onValueChange={(value) =>
            updateStatus.mutate({ id: row.original.id, status: value as AssetStatus })
          }
        >
          <SelectTrigger className="w-40 capitalize" onClick={(e) => e.stopPropagation()}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSET_STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {statusLabel(status)}
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
              New Asset
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Asset</SheetTitle>
              <SheetDescription>e.g. a projector or a laptop.</SheetDescription>
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
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <ProductCategorySelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="asset_tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset tag</FormLabel>
                      <FormControl>
                        <Input placeholder="AST-0001" {...field} />
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
                        <Input placeholder="Projector" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchase_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchase_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase cost</FormLabel>
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
                  <Button type="submit" disabled={createAsset.isPending}>
                    {createAsset.isPending && <Loader2 className="animate-spin" />}
                    Create asset
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={assets ?? []}
        isLoading={isPending}
        emptyMessage="No assets yet."
      />
    </div>
  )
}
