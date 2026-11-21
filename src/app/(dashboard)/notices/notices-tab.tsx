"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import {
  useCreateNotice,
  useDeleteNotice,
  useNotice,
  useNoticeSearch,
  useNotices,
  useUpdateNotice,
} from "@/hooks/use-notices"
import { useSessionScope } from "@/hooks/use-identity"
import { useSession } from "@/hooks/use-session"
import { noticeSearchBody, noticeUpdateBody, resolveBranch } from "@/lib/comms"
import { ADMIN_ROLES } from "@/types/auth"
import type { Notice, NoticeAudience } from "@/types/notices"

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

  const { data: scope } = useSessionScope()
  const sessionBranch = scope?.branch_id ?? undefined
  const all = useNotices()
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Notice | null>(null)
  const [detailId, setDetailId] = React.useState<string>()
  const [deleting, setDeleting] = React.useState<Notice | null>(null)
  const [filters, setFilters] = React.useState({ audience: "", start_date: "", end_date: "" })
  const [applied, setApplied] = React.useState<Record<string, string> | null>(null)
  const [filterError, setFilterError] = React.useState<string>()
  const search = useNoticeSearch(applied)
  const { data: notices, isPending } = applied ? search : all
  const createNotice = useCreateNotice()
  const updateNotice = useUpdateNotice()
  const deleteNotice = useDeleteNotice()
  const detail = useNotice(detailId)

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

  function closeForm() {
    setOpen(false)
    setEditing(null)
    form.reset()
  }

  function openEdit(notice: Notice) {
    setEditing(notice)
    form.reset({
      branch_id: notice.branch_id,
      title: notice.title,
      body: notice.body,
      audience: notice.audience,
      start_date: notice.start_date,
      end_date: notice.end_date,
      color_code: notice.color_code ?? "",
      location: notice.location ?? "",
    })
    setOpen(true)
  }

  function onSubmit(values: NoticeValues) {
    if (editing) {
      const { branch_id: _branch, ...rest } = values
      updateNotice.mutate(
        { id: editing.id, input: noticeUpdateBody(rest) },
        { onSuccess: closeForm }
      )
      return
    }
    createNotice.mutate(
      { ...values, branch_id: resolveBranch(values.branch_id, sessionBranch) ?? values.branch_id },
      { onSuccess: closeForm }
    )
  }

  function runSearch() {
    const { body, error } = noticeSearchBody(filters)
    setFilterError(error)
    if (!error) setApplied(Object.keys(body).length ? body : null)
  }
  const saving = createNotice.isPending || updateNotice.isPending

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-2">
          <Select
            value={filters.audience || "all-audiences"}
            onValueChange={(v) => setFilters((f) => ({ ...f, audience: v === "all-audiences" ? "" : v }))}
          >
            <SelectTrigger className="w-40" aria-label="Audience filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-audiences">All audiences</SelectItem>
              {(Object.keys(AUDIENCE_LABELS) as NoticeAudience[]).map((key) => (
                <SelectItem key={key} value={key}>{AUDIENCE_LABELS[key]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" className="w-40" aria-label="From date" value={filters.start_date}
            onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))} />
          <Input type="date" className="w-40" aria-label="To date" value={filters.end_date}
            onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))} />
          <Button variant="outline" onClick={runSearch}><Search />Search</Button>
          {applied && (
            <Button variant="ghost" onClick={() => { setApplied(null); setFilterError(undefined); setFilters({ audience: "", start_date: "", end_date: "" }) }}>
              Clear
            </Button>
          )}
        </div>
        {isAdmin && (
          <Sheet
            open={open}
            onOpenChange={(next) => {
              if (next) setOpen(true)
              else closeForm()
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
                <SheetTitle>{editing ? "Edit Notice" : "New Notice"}</SheetTitle>
                <SheetDescription>
                  {editing ? "Update this circular." : "Post a circular for a branch."}
                </SheetDescription>
              </SheetHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                  {!editing && (
                    <FormField
                      control={form.control}
                      name="branch_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <FormControl>
                            <BranchSelect value={field.value || sessionBranch} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
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
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="animate-spin" />}
                      {editing ? "Save changes" : "Post notice"}
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {filterError && <p role="alert" className="text-sm text-destructive">{filterError}</p>}
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
                <Button variant="ghost" size="sm" onClick={() => setDetailId(notice.id)}>Details</Button>
                {isAdmin && (
                  <>
                    <Button variant="ghost" size="icon" aria-label="Edit notice" onClick={() => openEdit(notice)}><Pencil /></Button>
                    <Button variant="ghost" size="icon" aria-label="Delete notice" onClick={() => setDeleting(notice)}><Trash2 /></Button>
                  </>
                )}
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
      <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detail.data?.title ?? "Notice"}</DialogTitle>
          </DialogHeader>
          {detail.isPending && <p className="text-sm text-muted-foreground">Loading...</p>}
          {detail.isError && <p className="text-sm text-destructive">Notice not found.</p>}
          {detail.data && (
            <div className="flex flex-col gap-2 text-sm">
              <p>{detail.data.body}</p>
              <p className="text-muted-foreground">
                {AUDIENCE_LABELS[detail.data.audience]} | {detail.data.start_date} - {detail.data.end_date}
              </p>
              {detail.data.location && <p className="text-muted-foreground">Location: {detail.data.location}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete notice?"
        description={`Delete "${deleting?.title ?? ""}" for all recipients? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isPending={deleteNotice.isPending}
        onConfirm={() => deleting && deleteNotice.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  )
}
