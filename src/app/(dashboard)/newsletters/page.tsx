"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Send } from "lucide-react"
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
import { useCreateNewsletter, useNewsletters, usePublishNewsletter } from "@/hooks/use-newsletters"
import { useSession } from "@/hooks/use-session"
import { ADMIN_ROLES } from "@/types/auth"
import type { NewsletterAudience } from "@/types/newsletters"

const AUDIENCE_LABELS: Record<NewsletterAudience, string> = {
  student: "Students",
  staff: "Staff",
  both: "Staff & Students",
}

const newsletterSchema = z
  .object({
    branch_id: z.string().min(1, "Branch is required"),
    title: z.string().min(1, "Title is required").max(200),
    body: z.string().min(1, "Body is required").max(2000),
    audience: z.enum(["student", "staff", "both"], { message: "Audience is required" }),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "End date must not be before start date",
    path: ["end_date"],
  })

type NewsletterValues = z.infer<typeof newsletterSchema>

export default function NewslettersPage() {
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)

  const { data: newsletters, isPending } = useNewsletters()
  const [open, setOpen] = React.useState(false)
  const createNewsletter = useCreateNewsletter()
  const publishNewsletter = usePublishNewsletter()

  const form = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      branch_id: "",
      title: "",
      body: "",
      audience: undefined,
      start_date: "",
      end_date: "",
    },
  })

  function onSubmit(values: NewsletterValues) {
    createNewsletter.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Newsletters</h1>
          <p className="text-sm text-muted-foreground">
            Circulars drafted first, then published when ready.
          </p>
        </div>
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
                New Draft
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>New Newsletter Draft</SheetTitle>
                <SheetDescription>Prepare a circular for a branch.</SheetDescription>
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
                          <Input placeholder="Term Newsletter" {...field} />
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
                          <Input placeholder="Highlights from this term..." {...field} />
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
                              {(Object.keys(AUDIENCE_LABELS) as NewsletterAudience[]).map((key) => (
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
                  <SheetFooter className="px-0">
                    <Button type="submit" disabled={createNewsletter.isPending}>
                      {createNewsletter.isPending && <Loader2 className="animate-spin" />}
                      Save draft
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {isPending && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!isPending && (newsletters?.length ?? 0) === 0 && (
        <p className="text-sm text-muted-foreground">No newsletters right now.</p>
      )}

      <div className="flex flex-col gap-3">
        {newsletters?.map((newsletter) => (
          <Card key={newsletter.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <CardTitle className="text-base">{newsletter.title}</CardTitle>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={newsletter.is_published ? "secondary" : "outline"}>
                  {newsletter.is_published ? "Published" : "Draft"}
                </Badge>
                <Badge variant="secondary">{AUDIENCE_LABELS[newsletter.audience]}</Badge>
                <span className="text-xs text-muted-foreground">
                  {newsletter.start_date} - {newsletter.end_date}
                </span>
                {isAdmin && !newsletter.is_published && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={publishNewsletter.isPending}
                    onClick={() => publishNewsletter.mutate(newsletter.id)}
                  >
                    <Send />
                    Publish
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{newsletter.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
