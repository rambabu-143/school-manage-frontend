"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCreateMessageGroup, useDeleteMessageGroup, useMessageGroups } from "@/hooks/use-message-groups"
import { useStaff } from "@/hooks/use-staff"
import { useStudents } from "@/hooks/use-students"
import type { MessageGroup } from "@/types/communications"

const groupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  student_ids: z.array(z.string()),
  staff_ids: z.array(z.string()),
})

type GroupValues = z.infer<typeof groupSchema>

export function GroupsTab() {
  const { data: groups, isPending } = useMessageGroups()
  const { data: students } = useStudents()
  const { data: staff } = useStaff()
  const [open, setOpen] = React.useState(false)
  const createGroup = useCreateMessageGroup()
  const deleteGroup = useDeleteMessageGroup()

  const form = useForm<GroupValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "", student_ids: [], staff_ids: [] },
  })
  const selectedStudentIds = form.watch("student_ids")
  const selectedStaffIds = form.watch("staff_ids")

  function onSubmit(values: GroupValues) {
    createGroup.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<MessageGroup>[] = [
    { accessorKey: "name", header: "Name" },
    {
      id: "members",
      header: "Members",
      cell: ({ row }) =>
        `${row.original.student_ids.length} student(s), ${row.original.staff_ids.length} staff`,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={() => deleteGroup.mutate(row.original.id)}>
            <Trash2 />
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
              New Group
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>New Group</SheetTitle>
              <SheetDescription>A saved set of recipients for repeat broadcasts.</SheetDescription>
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
                        <Input placeholder="Grade 5 Parents" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="student_ids"
                  render={() => (
                    <FormItem>
                      <FormLabel>Students</FormLabel>
                      <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-md border p-3">
                        {students?.length === 0 && (
                          <p className="text-sm text-muted-foreground">No students yet.</p>
                        )}
                        {students?.map((student) => (
                          <Label key={student.id} className="flex items-center gap-2 font-normal">
                            <Checkbox
                              checked={selectedStudentIds.includes(student.id)}
                              onCheckedChange={(checked) => {
                                form.setValue(
                                  "student_ids",
                                  checked
                                    ? [...selectedStudentIds, student.id]
                                    : selectedStudentIds.filter((id) => id !== student.id)
                                )
                              }}
                            />
                            {student.first_name} {student.last_name}
                          </Label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="staff_ids"
                  render={() => (
                    <FormItem>
                      <FormLabel>Staff</FormLabel>
                      <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-md border p-3">
                        {staff?.length === 0 && (
                          <p className="text-sm text-muted-foreground">No staff yet.</p>
                        )}
                        {staff?.map((member) => (
                          <Label key={member.id} className="flex items-center gap-2 font-normal">
                            <Checkbox
                              checked={selectedStaffIds.includes(member.id)}
                              onCheckedChange={(checked) => {
                                form.setValue(
                                  "staff_ids",
                                  checked
                                    ? [...selectedStaffIds, member.id]
                                    : selectedStaffIds.filter((id) => id !== member.id)
                                )
                              }}
                            />
                            {member.first_name} {member.last_name}
                          </Label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createGroup.isPending}>
                    {createGroup.isPending && <Loader2 className="animate-spin" />}
                    Create group
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={groups ?? []}
        isLoading={isPending}
        emptyMessage="No groups yet."
      />
    </div>
  )
}
