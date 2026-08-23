"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
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
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useAddGuardian, useDeleteStudent, useUpdateStudent } from "@/hooks/use-students"
import type { Student } from "@/types/people"

const studentEditSchema = z.object({
  branch_id: z.string().min(1),
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  gender: z.string().max(20).optional(),
  is_active: z.boolean(),
})

type StudentEditValues = z.infer<typeof studentEditSchema>

const guardianSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  relation: z.string().min(1, "Relation is required").max(50),
  phone: z.string().max(20).optional(),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
})

type GuardianValues = z.infer<typeof guardianSchema>

interface StudentDetailSheetProps {
  student: Student | null
  onOpenChange: (open: boolean) => void
}

export function StudentDetailSheet({ student, onOpenChange }: StudentDetailSheetProps) {
  const updateStudent = useUpdateStudent()
  const deleteStudent = useDeleteStudent()
  const addGuardian = useAddGuardian()

  const form = useForm<StudentEditValues>({
    resolver: zodResolver(studentEditSchema),
    values: student
      ? {
          branch_id: student.branch_id,
          first_name: student.first_name,
          last_name: student.last_name,
          gender: student.gender ?? "",
          is_active: student.is_active,
        }
      : undefined,
  })

  const guardianForm = useForm<GuardianValues>({
    resolver: zodResolver(guardianSchema),
    defaultValues: { name: "", relation: "", phone: "", email: "" },
  })

  if (!student) return null

  function onSubmit(values: StudentEditValues) {
    if (!student) return
    updateStudent.mutate({
      id: student.id,
      input: { ...values, gender: values.gender || undefined },
    })
  }

  function onAddGuardian(values: GuardianValues) {
    if (!student) return
    addGuardian.mutate(
      {
        studentId: student.id,
        input: {
          name: values.name,
          relation: values.relation,
          phone: values.phone || undefined,
          email: values.email || undefined,
        },
      },
      { onSuccess: () => guardianForm.reset() }
    )
  }

  function onDelete() {
    if (!student) return
    deleteStudent.mutate(student.id, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Sheet open={!!student} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {student.first_name} {student.last_name}
          </SheetTitle>
          <SheetDescription>
            Admission #{student.admission_number} &middot; Enrolled {student.enrollment_date}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
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
              <Button type="submit" disabled={updateStudent.isPending}>
                {updateStudent.isPending && <Loader2 className="animate-spin" />}
                Save changes
              </Button>
            </form>
          </Form>

          <Separator />

          <div className="flex flex-col gap-3">
            <Label>Guardians</Label>
            {student.guardians.length === 0 && (
              <p className="text-sm text-muted-foreground">No guardians added yet.</p>
            )}
            {student.guardians.map((guardian) => (
              <div
                key={guardian.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div>
                  <div className="font-medium">{guardian.name}</div>
                  <div className="text-muted-foreground">
                    {guardian.relation}
                    {guardian.phone ? ` · ${guardian.phone}` : ""}
                    {guardian.email ? ` · ${guardian.email}` : ""}
                  </div>
                </div>
                {guardian.user_id && <Badge variant="secondary">Portal linked</Badge>}
              </div>
            ))}

            <Form {...guardianForm}>
              <form
                onSubmit={guardianForm.handleSubmit(onAddGuardian)}
                className="flex flex-col gap-3 rounded-md border border-dashed p-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={guardianForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={guardianForm.control}
                    name="relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Relation</FormLabel>
                        <FormControl>
                          <Input placeholder="Father, Mother..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={guardianForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={guardianForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={addGuardian.isPending}
                >
                  {addGuardian.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Plus />
                  )}
                  Add guardian
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <SheetFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteStudent.isPending}>
                <Trash2 />
                Delete student
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this student?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes {student.first_name} {student.last_name} and
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
