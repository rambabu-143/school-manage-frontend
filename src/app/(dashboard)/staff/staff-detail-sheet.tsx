"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Trash2 } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { useDeleteStaff, useUpdateStaff } from "@/hooks/use-staff"
import type { Staff } from "@/types/people"

const staffEditSchema = z.object({
  branch_id: z.string().min(1),
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  designation: z.string().min(1, "Designation is required").max(100),
  phone: z.string().max(20).optional(),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  is_active: z.boolean(),
})

type StaffEditValues = z.infer<typeof staffEditSchema>

interface StaffDetailSheetProps {
  staff: Staff | null
  onOpenChange: (open: boolean) => void
}

export function StaffDetailSheet({ staff, onOpenChange }: StaffDetailSheetProps) {
  const updateStaff = useUpdateStaff()
  const deleteStaff = useDeleteStaff()

  const form = useForm<StaffEditValues>({
    resolver: zodResolver(staffEditSchema),
    values: staff
      ? {
          branch_id: staff.branch_id,
          first_name: staff.first_name,
          last_name: staff.last_name,
          designation: staff.designation,
          phone: staff.phone ?? "",
          email: staff.email ?? "",
          is_active: staff.is_active,
        }
      : undefined,
  })

  if (!staff) return null

  function onSubmit(values: StaffEditValues) {
    if (!staff) return
    updateStaff.mutate({
      id: staff.id,
      input: {
        ...values,
        phone: values.phone || undefined,
        email: values.email || undefined,
      },
    })
  }

  function onDelete() {
    if (!staff) return
    deleteStaff.mutate(staff.id, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Sheet open={!!staff} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {staff.first_name} {staff.last_name}
          </SheetTitle>
          <SheetDescription>
            Employee #{staff.employee_number} &middot; Joined {staff.date_of_joining}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
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
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
              <Button type="submit" disabled={updateStaff.isPending}>
                {updateStaff.isPending && <Loader2 className="animate-spin" />}
                Save changes
              </Button>
            </form>
          </Form>
        </div>

        <SheetFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteStaff.isPending}>
                <Trash2 />
                Delete staff member
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this staff member?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes {staff.first_name} {staff.last_name} and cannot
                  be undone.
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
