"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DataTable } from "@/components/data-table/data-table"
import { StreamSelect } from "@/components/stream-select"
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
import {
  useCreateStreamCombination,
  useStreamCombinations,
} from "@/hooks/use-stream-combinations"
import { useStreams } from "@/hooks/use-streams"
import { useSubjects } from "@/hooks/use-subjects"
import type { StreamCombination } from "@/types/streams"

const combinationSchema = z.object({
  stream_id: z.string().min(1, "Stream is required"),
  name: z.string().min(1, "Name is required").max(50),
  subject_ids: z.array(z.string()).min(1, "Select at least one subject"),
})

type CombinationValues = z.infer<typeof combinationSchema>

export function CombinationsTab() {
  const { data: combinations, isPending } = useStreamCombinations()
  const { data: streams } = useStreams()
  const { data: subjects } = useSubjects()
  const [open, setOpen] = React.useState(false)
  const createCombination = useCreateStreamCombination()

  const form = useForm<CombinationValues>({
    resolver: zodResolver(combinationSchema),
    defaultValues: { stream_id: "", name: "", subject_ids: [] },
  })
  const selectedSubjectIds = form.watch("subject_ids")

  function onSubmit(values: CombinationValues) {
    createCombination.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<StreamCombination>[] = [
    {
      id: "stream",
      header: "Stream",
      cell: ({ row }) => streams?.find((s) => s.id === row.original.stream_id)?.name ?? "—",
    },
    { accessorKey: "name", header: "Combination" },
    {
      id: "subjects",
      header: "Subjects",
      cell: ({ row }) =>
        row.original.subject_ids
          .map((id) => subjects?.find((s) => s.id === id)?.name ?? "?")
          .join(", "),
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
              New Combination
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Combination</SheetTitle>
              <SheetDescription>e.g. &quot;PCM&quot; (Physics, Chemistry, Math)</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                <FormField
                  control={form.control}
                  name="stream_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stream</FormLabel>
                      <FormControl>
                        <StreamSelect value={field.value} onChange={field.onChange} />
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
                        <Input placeholder="PCM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject_ids"
                  render={() => (
                    <FormItem>
                      <FormLabel>Subjects</FormLabel>
                      <div className="flex flex-col gap-2 rounded-md border p-3">
                        {subjects?.length === 0 && (
                          <p className="text-sm text-muted-foreground">No subjects yet.</p>
                        )}
                        {subjects?.map((subject) => (
                          <Label key={subject.id} className="flex items-center gap-2 font-normal">
                            <Checkbox
                              checked={selectedSubjectIds.includes(subject.id)}
                              onCheckedChange={(checked) => {
                                form.setValue(
                                  "subject_ids",
                                  checked
                                    ? [...selectedSubjectIds, subject.id]
                                    : selectedSubjectIds.filter((id) => id !== subject.id),
                                  { shouldValidate: true }
                                )
                              }}
                            />
                            {subject.name} ({subject.code})
                          </Label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createCombination.isPending}>
                    {createCombination.isPending && <Loader2 className="animate-spin" />}
                    Create combination
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={combinations ?? []}
        isLoading={isPending}
        emptyMessage="No combinations yet."
      />
    </div>
  )
}
