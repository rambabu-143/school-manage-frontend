"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { HostelSelect } from "@/components/hostel-select"
import { DataTable } from "@/components/data-table/data-table"
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
import { useCreateHostelRoom, useHostelRooms } from "@/hooks/use-hostel-rooms"
import { useHostels } from "@/hooks/use-hostels"
import type { HostelRoom } from "@/types/hostel"

import { RoomOccupantsSheet } from "./room-occupants-sheet"

const roomSchema = z.object({
  hostel_id: z.string().min(1, "Hostel is required"),
  room_number: z.string().min(1, "Room number is required").max(20),
  room_type: z.string().max(50).optional(),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
})

type RoomInput = z.input<typeof roomSchema>
type RoomValues = z.output<typeof roomSchema>

export function RoomsTab() {
  const { data: rooms, isPending } = useHostelRooms()
  const { data: hostels } = useHostels()
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<HostelRoom | null>(null)
  const createRoom = useCreateHostelRoom()

  const form = useForm<RoomInput, unknown, RoomValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: { hostel_id: "", room_number: "", room_type: "", capacity: 1 },
  })

  function onSubmit(values: RoomValues) {
    createRoom.mutate(
      { ...values, room_type: values.room_type || null },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const columns: ColumnDef<HostelRoom>[] = [
    {
      id: "hostel",
      header: "Hostel",
      cell: ({ row }) => hostels?.find((h) => h.id === row.original.hostel_id)?.name ?? "—",
    },
    { accessorKey: "room_number", header: "Room" },
    { accessorKey: "room_type", header: "Type", cell: ({ row }) => row.original.room_type ?? "—" },
    { accessorKey: "capacity", header: "Capacity" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
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
              <SheetDescription>Add a room to a hostel.</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
                <FormField
                  control={form.control}
                  name="hostel_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hostel</FormLabel>
                      <FormControl>
                        <HostelSelect value={field.value} onChange={field.onChange} />
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
                        <Input placeholder="101" {...field} />
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
                        <Input placeholder="Optional, e.g. Dormitory" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          {...field}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createRoom.isPending}>
                    {createRoom.isPending && <Loader2 className="animate-spin" />}
                    Create room
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
        onRowClick={setSelected}
        emptyMessage="No rooms yet."
      />

      <RoomOccupantsSheet room={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  )
}
