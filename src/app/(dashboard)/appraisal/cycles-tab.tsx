"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AcademicYearSelect } from "@/components/academic-year-select"
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
import { useAppraisalCycles, useCreateAppraisalCycle } from "@/hooks/use-appraisal-cycles"
import { useSession } from "@/hooks/use-session"
import { ADMIN_ROLES } from "@/types/auth"
import type { AppraisalCycle } from "@/types/appraisal"

const cycleSchema = z.object({
  academic_year_id: z.string().min(1, "Academic year is required"),
  name: z.string().min(1, "Name is required").max(100),
})

type CycleValues = z.infer<typeof cycleSchema>

const columns: ColumnDef<AppraisalCycle>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "open" ? "default" : "secondary"} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
]

export function CyclesTab() {
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)

  const { data: cycles, isPending } = useAppraisalCycles()
  const [open, setOpen] = React.useState(false)
  const createCycle = useCreateAppraisalCycle()

  const form = useForm<CycleValues>({
    resolver: zodResolver(cycleSchema),
    defaultValues: { academic_year_id: "", name: "" },
  })

  function onSubmit(values: CycleValues) {
    createCycle.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
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
                New Cycle
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>New Appraisal Cycle</SheetTitle>
                <SheetDescription>e.g. &quot;Annual Review 2026-27&quot;</SheetDescription>
              </SheetHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                  <FormField
                    control={form.control}
                    name="academic_year_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic year</FormLabel>
                        <FormControl>
                          <AcademicYearSelect value={field.value} onChange={field.onChange} />
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
                          <Input placeholder="Annual Review 2026-27" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <SheetFooter className="px-0">
                    <Button type="submit" disabled={createCycle.isPending}>
                      {createCycle.isPending && <Loader2 className="animate-spin" />}
                      Create cycle
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </div>
      )}

      <DataTable
        columns={columns}
        data={cycles ?? []}
        isLoading={isPending}
        emptyMessage="No appraisal cycles yet."
      />
    </div>
  )
}
