"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
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
import { useCreateStudent } from "@/hooks/use-students"

const studentSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  admission_number: z.string().min(1, "Admission number is required").max(50),
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().max(20).optional(),
  blood_group: z.string().max(10).optional(),
  allergies: z.string().max(500).optional(),
  pen_number: z.string().max(50).optional(),
  board_roll_number: z.string().max(50).optional(),
})

type StudentValues = z.infer<typeof studentSchema>

export function StudentFormSheet() {
  const [open, setOpen] = React.useState(false)
  const createStudent = useCreateStudent()

  const form = useForm<StudentValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      branch_id: "",
      admission_number: "",
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "",
      blood_group: "",
      allergies: "",
      pen_number: "",
      board_roll_number: "",
    },
  })

  function onSubmit(values: StudentValues) {
    createStudent.mutate(
      {
        ...values,
        gender: values.gender || undefined,
        blood_group: values.blood_group || undefined,
        allergies: values.allergies || undefined,
        pen_number: values.pen_number || undefined,
        board_roll_number: values.board_roll_number || undefined,
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
          <Plus />
          New Student
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Student</SheetTitle>
          <SheetDescription>Enroll a new student in a branch.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 px-4"
          >
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
              name="admission_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admission number</FormLabel>
                  <FormControl>
                    <Input placeholder="AN-0001" {...field} />
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="blood_group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood group</FormLabel>
                    <FormControl>
                      <Input placeholder="O+" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pen_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PEN number</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="board_roll_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board roll number</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="px-0">
              <Button type="submit" disabled={createStudent.isPending}>
                {createStudent.isPending && <Loader2 className="animate-spin" />}
                Create student
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
