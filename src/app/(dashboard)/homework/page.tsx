"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus, Trash2 } from "lucide-react"
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
import { DataTable } from "@/components/data-table/data-table"
import { SectionSelect } from "@/components/section-select"
import { SubjectSelect } from "@/components/subject-select"
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
import { Textarea } from "@/components/ui/textarea"
import { useCreateHomework, useDeleteHomework, useHomework } from "@/hooks/use-homework"
import { useSubjects } from "@/hooks/use-subjects"
import type { HomeworkAssignment } from "@/types/homework"

const homeworkSchema = z.object({
  section_id: z.string().min(1, "Section is required"),
  subject_id: z.string().min(1, "Subject is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  due_date: z.string().min(1, "Due date is required"),
})

type HomeworkValues = z.infer<typeof homeworkSchema>

export default function HomeworkPage() {
  const [sectionFilter, setSectionFilter] = React.useState<string>()
  const { data: homework, isPending } = useHomework(sectionFilter)
  const { data: subjects } = useSubjects()
  const [open, setOpen] = React.useState(false)
  const createHomework = useCreateHomework()
  const deleteHomework = useDeleteHomework()

  const form = useForm<HomeworkValues>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: { section_id: "", subject_id: "", title: "", description: "", due_date: "" },
  })

  function onSubmit(values: HomeworkValues) {
    createHomework.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<HomeworkAssignment>[] = [
    { accessorKey: "title", header: "Title" },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => subjects?.find((s) => s.id === row.original.subject_id)?.name ?? "—",
    },
    { accessorKey: "due_date", header: "Due date" },
    { accessorKey: "description", header: "Description" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{row.original.title}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteHomework.mutate(row.original.id)}>
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Homework</h1>
          <p className="text-sm text-muted-foreground">
            Assign homework to a section - guardians see it in the portal.
          </p>
        </div>

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
              New Homework
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Homework</SheetTitle>
              <SheetDescription>Assign homework to a section.</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                <FormField
                  control={form.control}
                  name="section_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <FormControl>
                        <SectionSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <SubjectSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Chapter 3 exercises" {...field} />
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
                        <Textarea
                          rows={4}
                          placeholder="Complete questions 1-10 from the textbook."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createHomework.isPending}>
                    {createHomework.isPending && <Loader2 className="animate-spin" />}
                    Assign homework
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col gap-2 sm:max-w-sm">
        <Label>Filter by section</Label>
        <SectionSelect value={sectionFilter} onChange={setSectionFilter} />
      </div>

      <DataTable
        columns={columns}
        data={homework ?? []}
        isLoading={isPending}
        emptyMessage="No homework assigned yet."
      />
    </div>
  )
}
