"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { DataTable } from "@/components/data-table/data-table"
import { ProductCategorySelect } from "@/components/product-category-select"
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
import { useProductCategories } from "@/hooks/use-product-categories"
import { useCreateProduct, useProducts } from "@/hooks/use-products"
import type { Product } from "@/types/inventory"

const productSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  category_id: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required").max(200),
  unit: z.string().min(1, "Unit is required").max(20),
})

type ProductValues = z.infer<typeof productSchema>

export function ProductsTab() {
  const { data: products, isPending } = useProducts()
  const { data: categories } = useProductCategories()
  const [open, setOpen] = React.useState(false)
  const createProduct = useCreateProduct()

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { branch_id: "", category_id: "", name: "", unit: "" },
  })

  function onSubmit(values: ProductValues) {
    createProduct.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Name" },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => categories?.find((c) => c.id === row.original.category_id)?.name ?? "—",
    },
    { accessorKey: "unit", header: "Unit" },
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
              New Product
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Product</SheetTitle>
              <SheetDescription>e.g. &quot;A4 Paper&quot;</SheetDescription>
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="A4 Paper" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="ream" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createProduct.isPending}>
                    {createProduct.isPending && <Loader2 className="animate-spin" />}
                    Create product
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={products ?? []}
        isLoading={isPending}
        emptyMessage="No products yet."
      />
    </div>
  )
}
