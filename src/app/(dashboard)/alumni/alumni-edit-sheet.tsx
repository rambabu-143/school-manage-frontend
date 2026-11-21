"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
} from "@/components/ui/sheet"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useDeleteAlumni, useUpdateAlumni } from "@/hooks/use-alumni"
import type { Alumni } from "@/types/alumni"
import type { Student } from "@/types/people"

const editSchema = z.object({
  current_institution: z.string().max(200).optional(),
  occupation: z.string().max(200).optional(),
  employer: z.string().max(200).optional(),
  contact_email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  contact_phone: z.string().max(20).optional(),
  notes: z.string().max(1000).optional(),
})

type EditValues = z.infer<typeof editSchema>

interface AlumniEditSheetProps {
  alumni: Alumni | null
  student: Student | undefined
  onOpenChange: (open: boolean) => void
}

export function AlumniEditSheet({ alumni, student, onOpenChange }: AlumniEditSheetProps) {
  const updateAlumni = useUpdateAlumni()
  const deleteAlumni = useDeleteAlumni()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      current_institution: alumni?.current_institution ?? "",
      occupation: alumni?.occupation ?? "",
      employer: alumni?.employer ?? "",
      contact_email: alumni?.contact_email ?? "",
      contact_phone: alumni?.contact_phone ?? "",
      notes: alumni?.notes ?? "",
    },
  })

  if (!alumni) return null

  function onSubmit(values: EditValues) {
    if (!alumni) return
    updateAlumni.mutate({
      id: alumni.id,
      input: {
        current_institution: values.current_institution || null,
        occupation: values.occupation || null,
        employer: values.employer || null,
        contact_email: values.contact_email || null,
        contact_phone: values.contact_phone || null,
        notes: values.notes || null,
      },
    })
  }

  return (
    <Sheet open={!!alumni} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {student ? `${student.first_name} ${student.last_name}` : "Alumni"}
          </SheetTitle>
          <SheetDescription>Class of {alumni.graduation_year}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
            <FormField
              control={form.control}
              name="current_institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current institution</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="px-0">
              <Button type="submit" disabled={updateAlumni.isPending}>
                {updateAlumni.isPending && <Loader2 className="animate-spin" />}
                Save changes
              </Button>
              <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete alumni record?"
        description={`Removes the alumni record${student ? ` of ${student.first_name} ${student.last_name}` : ""}. The student record is not deleted. This is written to the audit log.`}
        confirmLabel="Delete"
        destructive
        isPending={deleteAlumni.isPending}
        onConfirm={() =>
          alumni &&
          deleteAlumni.mutate(alumni.id, {
            onSuccess: () => {
              setConfirmDelete(false)
              onOpenChange(false)
            },
          })
        }
      />
    </Sheet>
  )
}
