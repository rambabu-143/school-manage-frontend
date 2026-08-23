"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
      </div>

      <Tabs defaultValue="mark">
        <TabsList>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
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
      </Tabs>
    </div>
  )
}
