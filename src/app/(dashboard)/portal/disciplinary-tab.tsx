"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useChildDisciplinaryRecords } from "@/hooks/use-portal"

export function DisciplinaryTab({ studentId }: { studentId: string }) {
  const { data: records, isPending } = useChildDisciplinaryRecords(studentId)

  if (isPending) return <p className="text-sm text-muted-foreground">Loading...</p>
  if (!records || records.length === 0) {
    return <p className="text-sm text-muted-foreground">No disciplinary records.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>{record.incident_date}</TableCell>
            <TableCell className="capitalize">{record.category}</TableCell>
            <TableCell className="capitalize">{record.severity}</TableCell>
            <TableCell>{record.description}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {record.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
