"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2 } from "lucide-react"

import { DataTable } from "@/components/data-table/data-table"
import { StaffSelect } from "@/components/staff-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMarkStaffAttendance, useStaffAttendance } from "@/hooks/use-staff-attendance"
import { useStaff } from "@/hooks/use-staff"
import { ATTENDANCE_STATUSES, type AttendanceStatus, type StaffAttendanceRecord } from "@/types/attendance"

function today() {
  return new Date().toISOString().slice(0, 10)
}

function statusLabel(status: AttendanceStatus) {
  return status.replace("_", " ")
}

export function StaffAttendanceTab() {
  const { data: staff } = useStaff()
  const [staffId, setStaffId] = React.useState<string>()
  const [date, setDate] = React.useState(today)
  const [status, setStatus] = React.useState<AttendanceStatus>("present")
  const [remarks, setRemarks] = React.useState("")
  const markAttendance = useMarkStaffAttendance()

  const { data: records, isPending } = useStaffAttendance({})
  const staffById = new Map(staff?.map((s) => [s.id, s]))

  function onSubmit() {
    if (!staffId) return
    markAttendance.mutate(
      { staff_id: staffId, date, status, remarks: remarks || null },
      { onSuccess: () => setRemarks("") }
    )
  }

  const columns: ColumnDef<StaffAttendanceRecord>[] = [
    {
      id: "staff",
      header: "Staff",
      cell: ({ row }) => {
        const member = staffById.get(row.original.staff_id)
        return member ? `${member.first_name} ${member.last_name}` : "Unknown"
      },
    },
    { accessorKey: "date", header: "Date" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <span className="capitalize">{statusLabel(row.original.status)}</span>,
    },
    { accessorKey: "remarks", header: "Remarks", cell: ({ row }) => row.original.remarks ?? "—" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label>Staff member</Label>
          <StaffSelect value={staffId} onChange={setStaffId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as AttendanceStatus)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATTENDANCE_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {statusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label>Remarks</Label>
          <Input value={remarks} placeholder="Optional" onChange={(e) => setRemarks(e.target.value)} />
        </div>
        <Button onClick={onSubmit} disabled={!staffId || markAttendance.isPending}>
          {markAttendance.isPending && <Loader2 className="animate-spin" />}
          Mark
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={records ?? []}
        isLoading={isPending}
        emptyMessage="No staff attendance records yet."
      />
    </div>
  )
}
