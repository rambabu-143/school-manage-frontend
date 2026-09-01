"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useChildObservationRemarks } from "@/hooks/use-portal"

export function ObservationsTab({ studentId }: { studentId: string }) {
  const { data: remarks, isPending } = useChildObservationRemarks(studentId)

  if (isPending) return <p className="text-sm text-muted-foreground">Loading...</p>
  if (!remarks || remarks.length === 0) {
    return <p className="text-sm text-muted-foreground">No remarks yet.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Term</TableHead>
          <TableHead>Remark</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {remarks.map((remark) => (
          <TableRow key={remark.id}>
            <TableCell>{remark.created_at.slice(0, 10)}</TableCell>
            <TableCell>{remark.term}</TableCell>
            <TableCell>{remark.remark}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
