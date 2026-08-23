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
import { useRouteStudents } from "@/hooks/use-transport-routes"
import type { TransportRoute } from "@/types/transport"

interface RouteStudentsSheetProps {
  route: TransportRoute | null
  onOpenChange: (open: boolean) => void
}

export function RouteStudentsSheet({ route, onOpenChange }: RouteStudentsSheetProps) {
  const { data: students, isPending } = useRouteStudents(route?.id)

  if (!route) return null

  return (
    <Sheet open={!!route} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{route.name}</SheetTitle>
          <SheetDescription>
            {route.driver_name ?? "No driver assigned"}
            {route.vehicle_number ? ` · ${route.vehicle_number}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          {isPending && <p className="text-sm text-muted-foreground">Loading roster...</p>}
          {!isPending && students?.length === 0 && (
            <p className="text-sm text-muted-foreground">No students assigned to this route.</p>
          )}
          {students && students.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Stop</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell className="font-medium">
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>{student.stop_name}</TableCell>
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
