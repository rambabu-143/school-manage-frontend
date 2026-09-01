"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus, Trash2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateMessageTemplate,
  useDeleteMessageTemplate,
  useMessageTemplates,
} from "@/hooks/use-message-templates"
import type { MessageTemplate } from "@/types/communications"

const templateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  body: z.string().min(1, "Body is required"),
})

type TemplateValues = z.infer<typeof templateSchema>

export function TemplatesTab() {
  const { data: templates, isPending } = useMessageTemplates()
  const [open, setOpen] = React.useState(false)
  const createTemplate = useCreateMessageTemplate()
  const deleteTemplate = useDeleteMessageTemplate()

  const form = useForm<TemplateValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: { name: "", body: "" },
  })

  function onSubmit(values: TemplateValues) {
    createTemplate.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  const columns: ColumnDef<MessageTemplate>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "body", header: "Body" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTemplate.mutate(row.original.id)}
          >
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
              New Template
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Template</SheetTitle>
              <SheetDescription>Reusable text for composing an email or SMS.</SheetDescription>
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
                        <Input placeholder="Fee Reminder" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body</FormLabel>
                      <FormControl>
                        <Textarea rows={6} placeholder="Your fee is due on..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createTemplate.isPending}>
                    {createTemplate.isPending && <Loader2 className="animate-spin" />}
                    Create template
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={templates ?? []}
        isLoading={isPending}
        emptyMessage="No templates yet."
      />
    </div>
  )
}
