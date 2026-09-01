"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { StaffSelect } from "@/components/staff-select"
import { Button } from "@/components/ui/button"
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
import { useImportMachinePunches } from "@/hooks/use-staff-attendance"
import type { MachinePunch } from "@/types/attendance"

function today() {
  return new Date().toISOString().slice(0, 10)
}

interface Row {
  staffId: string
  inTime: string
  outTime: string
}

export function MachineImportTab() {
  const [date, setDate] = React.useState(today)
  const [rows, setRows] = React.useState<Row[]>([{ staffId: "", inTime: "", outTime: "" }])
  const importPunches = useImportMachinePunches()

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addRow() {
    setRows((prev) => [...prev, { staffId: "", inTime: "", outTime: "" }])
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  function onSubmit() {
    const punches: MachinePunch[] = []
    for (const row of rows) {
      if (!row.staffId || !row.inTime) continue
      punches.push({ staff_id: row.staffId, punched_at: `${date}T${row.inTime}:00` })
      if (row.outTime) {
        punches.push({ staff_id: row.staffId, punched_at: `${date}T${row.outTime}:00` })
      }
    }
    if (punches.length === 0) return
    importPunches.mutate(
      { punches },
      { onSuccess: () => setRows([{ staffId: "", inTime: "", outTime: "" }]) }
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Manually reconcile raw punch times for a day - status (present/late/half-day) is derived
        automatically from each staff member&apos;s assigned shift. For an actual biometric
        device, point its export job at{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          POST /attendance/staff/machine-punches
        </code>{" "}
        instead of using this form.
      </p>

      <div className="flex flex-col gap-2 sm:w-48">
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff</TableHead>
            <TableHead className="w-36">In time</TableHead>
            <TableHead className="w-36">Out time</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <StaffSelect
                  value={row.staffId}
                  onChange={(value) => updateRow(index, { staffId: value })}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="time"
                  value={row.inTime}
                  onChange={(e) => updateRow(index, { inTime: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="time"
                  value={row.outTime}
                  onChange={(e) => updateRow(index, { outTime: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => removeRow(index)}>
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between">
        <Button variant="outline" onClick={addRow}>
          Add row
        </Button>
        <Button onClick={onSubmit} disabled={importPunches.isPending}>
          {importPunches.isPending && <Loader2 className="animate-spin" />}
          Import punches
        </Button>
      </div>
    </div>
  )
}
