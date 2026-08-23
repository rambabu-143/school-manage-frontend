"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRoomOccupants } from "@/hooks/use-hostel-rooms"
import type { HostelRoom } from "@/types/hostel"

interface RoomOccupantsSheetProps {
  room: HostelRoom | null
  onOpenChange: (open: boolean) => void
}

export function RoomOccupantsSheet({ room, onOpenChange }: RoomOccupantsSheetProps) {
  const { data: occupants, isPending } = useRoomOccupants(room?.id)

  if (!room) return null

  return (
    <Sheet open={!!room} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Room {room.room_number}</SheetTitle>
          <SheetDescription>
            {occupants?.length ?? 0} of {room.capacity} beds occupied
            {room.room_type ? ` · ${room.room_type}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          {isPending && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isPending && occupants?.length === 0 && (
            <p className="text-sm text-muted-foreground">No students assigned to this room.</p>
          )}
          {occupants && occupants.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Bed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {occupants.map((occupant) => (
                  <TableRow key={occupant.student_id}>
                    <TableCell className="font-medium">
                      {occupant.first_name} {occupant.last_name}
                    </TableCell>
                    <TableCell>{occupant.bed_number ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
