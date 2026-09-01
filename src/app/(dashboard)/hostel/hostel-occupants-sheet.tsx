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
import { useHostelOccupants } from "@/hooks/use-hostels"
import type { Hostel } from "@/types/hostel"

interface HostelOccupantsSheetProps {
  hostel: Hostel | null
  onOpenChange: (open: boolean) => void
}

export function HostelOccupantsSheet({ hostel, onOpenChange }: HostelOccupantsSheetProps) {
  const { data: occupants, isPending } = useHostelOccupants(hostel?.id)

  if (!hostel) return null

  return (
    <Sheet open={!!hostel} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{hostel.name}</SheetTitle>
          <SheetDescription>{occupants?.length ?? 0} student(s) allocated</SheetDescription>
        </SheetHeader>

        <div className="px-4">
          {isPending && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isPending && occupants?.length === 0 && (
            <p className="text-sm text-muted-foreground">No students allocated to this hostel yet.</p>
          )}
          {occupants && occupants.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Bed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {occupants.map((occupant) => (
                  <TableRow key={occupant.student_id}>
                    <TableCell className="font-medium">
                      {occupant.first_name} {occupant.last_name}
                    </TableCell>
                    <TableCell>{occupant.room_number}</TableCell>
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
