"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCreateNotice, useNotices } from "@/hooks/use-notices"
import { useSession } from "@/hooks/use-session"
import { ADMIN_ROLES } from "@/types/auth"
import type { NoticeAudience } from "@/types/notices"

const AUDIENCE_LABELS: Record<NoticeAudience, string> = {
  student: "Students",
  parent: "Parents",
  staff: "Staff",
  all: "Everyone",
}

const noticeSchema = z
  .object({
    branch_id: z.string().min(1, "Branch is required"),
    title: z.string().min(1, "Title is required").max(200),
    body: z.string().min(1, "Body is required").max(2000),
    audience: z.enum(["student", "parent", "staff", "all"], {
      message: "Audience is required",
    }),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    color_code: z.string().max(20).optional(),
    location: z.string().max(200).optional(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "End date must not be before start date",
    path: ["end_date"],
  })

type NoticeValues = z.infer<typeof noticeSchema>

export function NoticesTab() {
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)

  const { data: notices, isPending } = useNotices()
  const [open, setOpen] = React.useState(false)
  const createNotice = useCreateNotice()

  const form = useForm<NoticeValues>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      branch_id: "",
      title: "",
      body: "",
      audience: undefined,
      start_date: "",
      end_date: "",
      color_code: "",
      location: "",
    },
  })

  function onSubmit(values: NoticeValues) {
    createNotice.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        {isAdmin && (
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
                New Notice
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>New Notice</SheetTitle>
                <SheetDescription>Post a circular for a branch.</SheetDescription>
              </SheetHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                  <FormField
                    control={form.control}
                    name="branch_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <FormControl>
                          <BranchSelect value={field.value} onChange={field.onChange} />
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
                          <Input placeholder="Founder's Day" {...field} />
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
                          <Input placeholder="School will remain closed on..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="audience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audience</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an audience" />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(AUDIENCE_LABELS) as NoticeAudience[]).map((key) => (
                                <SelectItem key={key} value={key}>
                                  {AUDIENCE_LABELS[key]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="color_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calendar color (optional)</FormLabel>
                          <FormControl>
                            <Input type="color" className="h-10 w-full p-1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Main Auditorium" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <SheetFooter className="px-0">
                    <Button type="submit" disabled={createNotice.isPending}>
                      {createNotice.isPending && <Loader2 className="animate-spin" />}
                      Post notice
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {isPending && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!isPending && (notices?.length ?? 0) === 0 && (
        <p className="text-sm text-muted-foreground">No notices right now.</p>
      )}

      <div className="flex flex-col gap-3">
        {notices?.map((notice) => (
          <Card key={notice.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-base">
                {notice.color_code && (
                  <span
                    className="size-3 shrink-0 rounded-full border"
                    style={{ backgroundColor: notice.color_code }}
                  />
                )}
                {notice.title}
              </CardTitle>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary">{AUDIENCE_LABELS[notice.audience]}</Badge>
                <span className="text-xs text-muted-foreground">
                  {notice.start_date} - {notice.end_date}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{notice.body}</p>
              {notice.location && (
                <p className="mt-1 text-xs text-muted-foreground">📍 {notice.location}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
