"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import Link from "next/link"

import { MachineImportTab } from "./machine-import-tab"
import { MarkAttendanceTab } from "./mark-attendance-tab"
import { StaffAttendanceTab } from "./staff-attendance-tab"
import { SummaryTab } from "./summary-tab"

export default function AttendancePage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Mark daily attendance and review section summaries.
        </p>
        <nav aria-label="Attendance tools" className="mt-2 flex flex-wrap gap-3 text-sm">
          {[["/attendance/school-days", "School days & terms"], ["/attendance/transport", "Transport"], ["/attendance/reports", "Reports"], ["/attendance/reasons", "Reasons"]].map(([h, l]) => (
            <Link key={h} href={h} className="underline">{l}</Link>
          ))}
        </nav>
      </div>

      <Tabs defaultValue="mark">
        <TabsList>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="machine-import">Machine Import</TabsTrigger>
        </TabsList>
        <TabsContent value="mark">
          <MarkAttendanceTab />
        </TabsContent>
        <TabsContent value="summary">
          <SummaryTab />
        </TabsContent>
        <TabsContent value="staff">
          <StaffAttendanceTab />
        </TabsContent>
        <TabsContent value="machine-import">
          <MachineImportTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
