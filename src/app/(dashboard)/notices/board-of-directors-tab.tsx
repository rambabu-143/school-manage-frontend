"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import {
  useBoardOfDirectors,
  useCreateBoardOfDirector,
  useUpdateBoardOfDirector,
} from "@/hooks/use-notices"
import type { BoardOfDirector } from "@/types/notices"

const memberSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  designation: z.string().min(1, "Designation is required").max(100),
  email: z.string().email().optional().or(z.literal("")),
  mobile: z.string().max(20).optional(),
})

type MemberValues = z.infer<typeof memberSchema>

export function BoardOfDirectorsTab() {
  const { data: members, isPending } = useBoardOfDirectors()
  const [open, setOpen] = React.useState(false)
  const createMember = useCreateBoardOfDirector()
  const updateMember = useUpdateBoardOfDirector()

  const form = useForm<MemberValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: "", designation: "", email: "", mobile: "" },
  })

  function onSubmit(values: MemberValues) {
    createMember.mutate(
      { ...values, email: values.email || null, mobile: values.mobile || null },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<BoardOfDirector>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "designation", header: "Designation" },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? "—" },
    { accessorKey: "mobile", header: "Mobile", cell: ({ row }) => row.original.mobile ?? "—" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge>Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            disabled={updateMember.isPending}
            onClick={() =>
              updateMember.mutate({
                id: row.original.id,
                input: { is_active: !row.original.is_active },
              })
            }
          >
            {row.original.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
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
              New Member
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Board Member</SheetTitle>
              <SheetDescription>Add a board/trust member contact.</SheetDescription>
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
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="Chairperson" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optional)</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createMember.isPending}>
                    {createMember.isPending && <Loader2 className="animate-spin" />}
                    Add member
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={members ?? []}
        isLoading={isPending}
        emptyMessage="No board members yet."
      />
    </div>
  )
}
