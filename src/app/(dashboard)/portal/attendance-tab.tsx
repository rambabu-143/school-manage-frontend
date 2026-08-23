"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useChildAttendance } from "@/hooks/use-portal"

function firstDayOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function AttendanceTab({ studentId }: { studentId: string }) {
  const [dateFrom, setDateFrom] = React.useState(firstDayOfMonth)
  const [dateTo, setDateTo] = React.useState(today)

  const { data: records, isPending } = useChildAttendance(studentId, { dateFrom, dateTo })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <Label>From</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>To</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      {isPending && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!isPending && records?.length === 0 && (
        <p className="text-sm text-muted-foreground">No attendance records for this range.</p>
      )}
      {records && records.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.date}</TableCell>
                <TableCell className="capitalize">{record.status.replace("_", " ")}</TableCell>
                <TableCell>{record.remarks ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
