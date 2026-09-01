"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  useCreateMasterDataItem,
  useDeleteMasterDataItem,
  useMasterData,
  useUpdateMasterDataItem,
} from "@/hooks/use-master-data"
import { MASTER_DATA_CATEGORIES, type MasterDataCategory, type MasterDataItem } from "@/types/masterdata"

const CATEGORY_LABELS: Record<MasterDataCategory, string> = {
  city: "City",
  state: "State",
  country: "Country",
  bank: "Bank",
  occupation: "Occupation",
  qualification: "Qualification",
  mother_tongue: "Mother Tongue",
  cost_center: "Cost Center",
  special_need: "Special Need",
  achievement: "Achievement",
  prefect_post: "Prefect Post",
  category: "Category",
  employee_type: "Employee Type",
  concession_type: "Concession Type",
}

const itemSchema = z.object({
  category: z.enum(MASTER_DATA_CATEGORIES),
  name: z.string().min(1, "Name is required").max(150),
  code: z.string().max(50).optional(),
  sort_order: z.coerce.number().int().optional(),
  note: z.string().max(500).optional(),
})

type ItemInput = z.input<typeof itemSchema>
type ItemValues = z.output<typeof itemSchema>

export default function MasterDataPage() {
  const [category, setCategory] = React.useState<MasterDataCategory>("city")
  const { data: items, isPending } = useMasterData(category)
  const createItem = useCreateMasterDataItem()
  const updateItem = useUpdateMasterDataItem()
  const deleteItem = useDeleteMasterDataItem()

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<MasterDataItem | null>(null)

  const form = useForm<ItemInput, unknown, ItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { category, name: "", code: "", sort_order: undefined, note: "" },
  })

  function openCreate() {
    setEditing(null)
    form.reset({ category, name: "", code: "", sort_order: undefined, note: "" })
    setOpen(true)
  }

  function openEdit(item: MasterDataItem) {
    setEditing(item)
    form.reset({
      category: item.category,
      name: item.name,
      code: item.code ?? "",
      sort_order: item.sort_order ?? undefined,
      note: item.note ?? "",
    })
    setOpen(true)
  }

  function onSubmit(values: ItemValues) {
    const payload = {
      name: values.name,
      code: values.code || null,
      sort_order: values.sort_order ?? null,
      note: values.note || null,
    }
    if (editing) {
      updateItem.mutate(
        { id: editing.id, ...payload },
        { onSuccess: () => setOpen(false) }
      )
    } else {
      createItem.mutate(
        { category: values.category, ...payload },
        { onSuccess: () => setOpen(false) }
      )
    }
  }

  const columns: ColumnDef<MasterDataItem>[] = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => row.original.code ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "sort_order",
      header: "Order",
      cell: ({ row }) => row.original.sort_order ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => row.original.note ?? <span className="text-muted-foreground">—</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)}>
            <Pencil />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{row.original.name}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteItem.mutate(row.original.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Master Data</h1>
        <p className="text-sm text-muted-foreground">
          Reference lists used as dropdown values across forms - cities, banks, qualifications,
          and the like.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Select value={category} onValueChange={(value) => setCategory(value as MasterDataCategory)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MASTER_DATA_CATEGORIES.map((key) => (
              <SelectItem key={key} value={key}>
                {CATEGORY_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Sheet
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) setEditing(null)
          }}
        >
          <SheetTrigger asChild>
            <Button onClick={openCreate}>
              <Plus />
              New Item
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editing ? "Edit Item" : "New Item"}</SheetTitle>
              <SheetDescription>{CATEGORY_LABELS[category]}</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Optional"
                          {...field}
                          value={(field.value as number | undefined) ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                    {(createItem.isPending || updateItem.isPending) && (
                      <Loader2 className="animate-spin" />
                    )}
                    {editing ? "Save changes" : "Create item"}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={items ?? []}
        isLoading={isPending}
        emptyMessage="No items yet."
      />
    </div>
  )
}
