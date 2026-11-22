"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BranchSelect } from "@/components/branch-select"
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
import { useCreateRoom, useRooms, useSchoolBlocks } from "@/hooks/use-rooms"
import { buildRoomPayload, missingRoomFields } from "@/lib/rooms"
import type { Room, RoomType } from "@/types/rooms"

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  reception: "Reception",
  staff_room: "Staff Room",
  lab: "Lab",
  office: "Office",
  classroom: "Classroom",
  conference: "Conference Room",
  other: "Other",
}

const roomSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  room_number: z.string().min(1, "Room number is required").max(50),
  room_type: z.enum(
    ["reception", "staff_room", "lab", "office", "classroom", "conference", "other"],
    { message: "Room type is required" }
  ),
  floor: z.string().max(20).optional(),
  block: z.string().max(50).optional(),
  block_id: z.string().optional(),
  area: z.string().max(50).optional(),
  facing: z.string().max(20).optional(),
  capacity: z.coerce.number().int().gt(0).optional(),
}).superRefine((v, ctx) => {
  // reception/staff_room/lab/office/classroom/conference need the full description (backend 422s otherwise)
  for (const name of missingRoomFields(v.room_type, v)) {
    ctx.addIssue({ code: "custom", path: [name === "block" ? "block_id" : name], message: `${name === "block" ? "Block" : name[0].toUpperCase() + name.slice(1)} is required for this room type` })
  }
})

type RoomInput = z.input<typeof roomSchema>
type RoomValues = z.output<typeof roomSchema>

const columns: ColumnDef<Room>[] = [
  { accessorKey: "room_number", header: "Room #" },
  {
    id: "room_type",
    header: "Type",
    cell: ({ row }) => <Badge variant="secondary">{ROOM_TYPE_LABELS[row.original.room_type]}</Badge>,
  },
  { accessorKey: "block", header: "Block", cell: ({ row }) => row.original.block ?? "—" },
  { accessorKey: "floor", header: "Floor", cell: ({ row }) => row.original.floor ?? "—" },
  { accessorKey: "capacity", header: "Capacity", cell: ({ row }) => row.original.capacity ?? "—" },
]

export default function RoomsPage() {
  const { data: rooms, isPending } = useRooms()
  const [open, setOpen] = React.useState(false)
  const createRoom = useCreateRoom()

  const form = useForm<RoomInput, unknown, RoomValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: { branch_id: "", room_number: "", floor: "", block: "", block_id: "", area: "", facing: "" },
  })
  const branchId = form.watch("branch_id")
  const { data: blocks } = useSchoolBlocks(branchId || undefined)

  function onSubmit(values: RoomValues) {
    createRoom.mutate(
      buildRoomPayload(values),
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Rooms</h1>
          <p className="text-sm text-muted-foreground">
            {rooms?.length ?? 0} room{rooms?.length === 1 ? "" : "s"}
          </p>
        </div>
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
              New Room
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Room</SheetTitle>
              <SheetDescription>Add a physical space to the directory.</SheetDescription>
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
                        <BranchSelect value={field.value} onChange={(v) => { field.onChange(v); form.setValue("block_id", "") }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="room_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room number</FormLabel>
                      <FormControl>
                        <Input placeholder="R-101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="room_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((key) => (
                              <SelectItem key={key} value={key}>
                                {ROOM_TYPE_LABELS[key]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="block_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School block</FormLabel>
                      <FormControl>
                        <Select value={field.value || undefined} onValueChange={field.onChange} disabled={!branchId}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={branchId ? "Select a block (manage under Blocks)" : "Pick a branch first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {blocks?.map((b) => (
                              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
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
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 400 sq ft" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="facing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facing</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. North" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="block"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Block (text)</FormLabel>
                        <FormControl>
                          <Input placeholder="Required unless type is Other" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="floor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Floor</FormLabel>
                        <FormControl>
                          <Input placeholder="Required unless type is Other" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Required unless type is Other"
                          {...field}
                          value={field.value as number | undefined ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createRoom.isPending}>
                    {createRoom.isPending && <Loader2 className="animate-spin" />}
                    Add room
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        columns={columns}
        data={rooms ?? []}
        isLoading={isPending}
        emptyMessage="No rooms added yet."
      />
    </div>
  )
}
