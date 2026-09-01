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
import { useHouseMembers } from "@/hooks/use-houses"
import type { House } from "@/types/houses"

interface HouseRosterSheetProps {
  house: House | null
  onOpenChange: (open: boolean) => void
}

export function HouseRosterSheet({ house, onOpenChange }: HouseRosterSheetProps) {
  const { data: members, isPending } = useHouseMembers(house?.id)

  if (!house) return null

  return (
    <Sheet open={!!house} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{house.name}</SheetTitle>
          <SheetDescription>{members?.length ?? 0} student(s)</SheetDescription>
        </SheetHeader>

        <div className="px-4">
          {isPending && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isPending && members?.length === 0 && (
            <p className="text-sm text-muted-foreground">No students in this house yet.</p>
          )}
          {members && members.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission No.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.student_id}>
                    <TableCell className="font-medium">
                      {member.first_name} {member.last_name}
                    </TableCell>
                    <TableCell>{member.admission_number}</TableCell>
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
