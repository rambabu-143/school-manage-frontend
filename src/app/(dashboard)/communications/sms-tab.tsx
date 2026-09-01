"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Send, Settings } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useSendSms, useSetSmsConfig, useSmsConfig, useSmsMessages } from "@/hooks/use-communications"
import type { SmsMessage } from "@/types/communications"

const configSchema = z.object({
  api_key: z.string().min(1, "Required"),
  sender_id: z.string().min(1, "Required").max(20),
  is_active: z.boolean(),
})
type ConfigValues = z.infer<typeof configSchema>

const composeSchema = z.object({
  body: z.string().min(1, "Required").max(500),
  recipients: z.string().min(1, "At least one recipient phone number is required"),
})
type ComposeValues = z.infer<typeof composeSchema>

function parseRecipients(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function ConfigSheet() {
  const { data: config } = useSmsConfig()
  const [open, setOpen] = React.useState(false)
  const setConfig = useSetSmsConfig()

  const form = useForm<ConfigValues>({
    resolver: zodResolver(configSchema),
    defaultValues: { api_key: "", sender_id: config?.sender_id ?? "", is_active: true },
  })

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      form.reset({ api_key: "", sender_id: config?.sender_id ?? "", is_active: config?.is_active ?? true })
    }
  }

  function onSubmit(values: ConfigValues) {
    setConfig.mutate(values, { onSuccess: () => setOpen(false) })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Settings />
          SMS Settings
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>TextLocal Settings</SheetTitle>
          <SheetDescription>Your school&apos;s own TextLocal account.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sender_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sender ID</FormLabel>
                  <FormControl>
                    <Input placeholder="SCHOOL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                  <FormLabel className="cursor-pointer">Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <SheetFooter className="px-0">
              <Button type="submit" disabled={setConfig.isPending}>
                {setConfig.isPending && <Loader2 className="animate-spin" />}
                Save settings
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

function ComposeSheet() {
  const [open, setOpen] = React.useState(false)
  const sendSms = useSendSms()

  const form = useForm<ComposeValues>({
    resolver: zodResolver(composeSchema),
    defaultValues: { body: "", recipients: "" },
  })

  function onSubmit(values: ComposeValues) {
    sendSms.mutate(
      { body: values.body, extra_phones: parseRecipients(values.recipients) },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset()
      }}
    >
      <SheetTrigger asChild>
        <Button>
          <Send />
          Compose SMS
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Compose SMS</SheetTitle>
          <SheetDescription>One gateway call for the whole batch.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
            <FormField
              control={form.control}
              name="recipients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipients</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="One phone number per line, or comma-separated"
                      {...field}
                    />
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
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea rows={4} maxLength={500} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="px-0">
              <Button type="submit" disabled={sendSms.isPending}>
                {sendSms.isPending && <Loader2 className="animate-spin" />}
                Send
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

const columns: ColumnDef<SmsMessage>[] = [
  { accessorKey: "body", header: "Message", cell: ({ row }) => (
    <span className="line-clamp-1">{row.original.body}</span>
  ) },
  {
    id: "recipients",
    header: "Recipients",
    cell: ({ row }) => row.original.recipients.length,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "sent" ? "default" : "destructive"} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: "sent_at", header: "Sent" },
]

export function SmsTab() {
  const { data: config } = useSmsConfig()
  const { data: messages, isPending } = useSmsMessages()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        {config ? (
          <p className="text-sm text-muted-foreground">
            Sending as <span className="font-medium">{config.sender_id}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">SMS is not configured yet.</p>
        )}
        <div className="flex gap-2">
          <ConfigSheet />
          <ComposeSheet />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={messages ?? []}
        isLoading={isPending}
        emptyMessage="No SMS sent yet."
      />
    </div>
  )
}
