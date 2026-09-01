"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { useCreateDepartment, useDepartments } from "@/hooks/use-departments"
import type { Department } from "@/types/departments"

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  sequence: z.coerce.number().int().min(1, "Sequence must be at least 1"),
})

type DepartmentInput = z.input<typeof departmentSchema>
type DepartmentValues = z.output<typeof departmentSchema>

const columns: ColumnDef<Department>[] = [
  { accessorKey: "sequence", header: "#" },
  { accessorKey: "name", header: "Name" },
]

export function DepartmentsTab() {
  const { data: departments, isPending } = useDepartments()
  const [open, setOpen] = React.useState(false)
  const createDepartment = useCreateDepartment()

  const form = useForm<DepartmentInput, unknown, DepartmentValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", sequence: 1 },
  })

  function onSubmit(values: DepartmentValues) {
    createDepartment.mutate(values, {
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
              New Department
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Department</SheetTitle>
              <SheetDescription>e.g. &quot;Science&quot;</SheetDescription>
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
                        <Input placeholder="Science" {...field} />
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
                  <Button type="submit" disabled={createDepartment.isPending}>
                    {createDepartment.isPending && <Loader2 className="animate-spin" />}
                    Create department
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={departments ?? []}
        isLoading={isPending}
        emptyMessage="No departments yet."
      />
    </div>
  )
}
