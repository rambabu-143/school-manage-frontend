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
import {
  useEmailConfig,
  useEmailMessages,
  useSendEmail,
  useSetEmailConfig,
} from "@/hooks/use-communications"
import type { EmailMessage } from "@/types/communications"

const configSchema = z.object({
  smtp_host: z.string().min(1, "Required"),
  smtp_port: z.coerce.number().int().min(1).max(65535),
  smtp_username: z.string().min(1, "Required"),
  smtp_password: z.string().min(1, "Required"),
  use_tls: z.boolean(),
  from_email: z.string().email("Must be a valid email"),
  from_name: z.string().optional(),
  is_active: z.boolean(),
})
type ConfigInput = z.input<typeof configSchema>
type ConfigValues = z.output<typeof configSchema>

const composeSchema = z.object({
  subject: z.string().min(1, "Required").max(200),
  body: z.string().min(1, "Required"),
  recipients: z.string().min(1, "At least one recipient email is required"),
})
type ComposeValues = z.infer<typeof composeSchema>

function parseRecipients(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function statusVariant(status: EmailMessage["status"]) {
  if (status === "sent") return "default" as const
  if (status === "partial") return "secondary" as const
  return "destructive" as const
}

function ConfigSheet() {
  const { data: config } = useEmailConfig()
  const [open, setOpen] = React.useState(false)
  const setConfig = useSetEmailConfig()

  const form = useForm<ConfigInput, unknown, ConfigValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      smtp_host: config?.smtp_host ?? "",
      smtp_port: config?.smtp_port ?? 587,
      smtp_username: config?.smtp_username ?? "",
      smtp_password: "",
      use_tls: config?.use_tls ?? true,
      from_email: config?.from_email ?? "",
      from_name: config?.from_name ?? "",
      is_active: config?.is_active ?? true,
    },
  })

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      form.reset({
        smtp_host: config?.smtp_host ?? "",
        smtp_port: config?.smtp_port ?? 587,
        smtp_username: config?.smtp_username ?? "",
        smtp_password: "",
        use_tls: config?.use_tls ?? true,
        from_email: config?.from_email ?? "",
        from_name: config?.from_name ?? "",
        is_active: config?.is_active ?? true,
      })
    }
  }

  function onSubmit(values: ConfigValues) {
    setConfig.mutate(
      { ...values, from_name: values.from_name || null },
      { onSuccess: () => setOpen(false) }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Settings />
          Email Settings
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>SMTP Settings</SheetTitle>
          <SheetDescription>Your school&apos;s own outbound mailbox.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
            <FormField
              control={form.control}
              name="smtp_host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP host</FormLabel>
                  <FormControl>
                    <Input placeholder="smtp.gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smtp_port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value as number} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smtp_username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smtp_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="use_tls"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                  <FormLabel className="cursor-pointer">Use TLS</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="from_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From address</FormLabel>
                  <FormControl>
                    <Input placeholder="school@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="from_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From name</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
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
  const sendEmail = useSendEmail()

  const form = useForm<ComposeValues>({
    resolver: zodResolver(composeSchema),
    defaultValues: { subject: "", body: "", recipients: "" },
  })

  function onSubmit(values: ComposeValues) {
    sendEmail.mutate(
      {
        subject: values.subject,
        body: values.body,
        extra_emails: parseRecipients(values.recipients),
      },
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
          Compose Email
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Compose Email</SheetTitle>
          <SheetDescription>Sent as a bcc-style broadcast - recipients never see each other.</SheetDescription>
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
                      placeholder="One email per line, or comma-separated"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea rows={6} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="px-0">
              <Button type="submit" disabled={sendEmail.isPending}>
                {sendEmail.isPending && <Loader2 className="animate-spin" />}
                Send
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

const columns: ColumnDef<EmailMessage>[] = [
  { accessorKey: "subject", header: "Subject" },
  {
    id: "recipients",
    header: "Recipients",
    cell: ({ row }) => row.original.recipients.length,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.status)} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: "sent_at", header: "Sent" },
]

export function EmailTab() {
  const { data: config } = useEmailConfig()
  const { data: messages, isPending } = useEmailMessages()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        {config ? (
          <p className="text-sm text-muted-foreground">
            Sending from <span className="font-medium">{config.from_email}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Email is not configured yet.</p>
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
        emptyMessage="No emails sent yet."
      />
    </div>
  )
}
