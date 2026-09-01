"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
import { DepartmentSelect } from "@/components/department-select"
import { UserSelect } from "@/components/user-select"
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
import { useCreateStaff } from "@/hooks/use-staff"
import { ASSIGNABLE_ROLES, ROLES } from "@/types/auth"

const STAFF_LOGIN_ROLES = ASSIGNABLE_ROLES.filter(
  (role) => role !== ROLES.PARENT && role !== ROLES.STUDENT
)

const staffSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  employee_number: z.string().min(1, "Employee number is required").max(50),
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  designation: z.string().min(1, "Designation is required").max(100),
  phone: z.string().max(20).optional(),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  user_id: z.string().optional(),
  department_id: z.string().optional(),
  contract_end_date: z.string().optional(),
})

type StaffValues = z.infer<typeof staffSchema>

export function StaffFormSheet() {
  const [open, setOpen] = React.useState(false)
  const createStaff = useCreateStaff()

  const form = useForm<StaffValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      branch_id: "",
      employee_number: "",
      first_name: "",
      last_name: "",
      designation: "",
      phone: "",
      email: "",
      user_id: "",
      department_id: "",
      contract_end_date: "",
    },
  })

  function onSubmit(values: StaffValues) {
    createStaff.mutate(
      {
        ...values,
        phone: values.phone || undefined,
        email: values.email || undefined,
        user_id: values.user_id || undefined,
        department_id: values.department_id || undefined,
        contract_end_date: values.contract_end_date || undefined,
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
          New Staff
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Staff Member</SheetTitle>
          <SheetDescription>Add a new employee to a branch.</SheetDescription>
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
              name="employee_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee number</FormLabel>
                  <FormControl>
                    <Input placeholder="EMP-0001" {...field} />
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
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Mathematics Teacher" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <DepartmentSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contract_end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract end date</FormLabel>
                  <FormControl>
                    <Input type="date" placeholder="Leave blank for permanent staff" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portal login</FormLabel>
                  <FormControl>
                    <UserSelect
                      value={field.value}
                      onChange={field.onChange}
                      roles={STAFF_LOGIN_ROLES}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="px-0">
              <Button type="submit" disabled={createStaff.isPending}>
                {createStaff.isPending && <Loader2 className="animate-spin" />}
                Create staff member
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
