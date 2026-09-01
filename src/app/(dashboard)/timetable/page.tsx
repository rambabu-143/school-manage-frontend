"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { PeriodsTab } from "./periods-tab"
import { ScheduleTab } from "./schedule-tab"

export default function TimetablePage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Timetable</h1>
        <p className="text-sm text-muted-foreground">
          Periods and the weekly class schedule. Subjects are managed from Gradebook.
        </p>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="periods">Periods</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule">
          <ScheduleTab />
        </TabsContent>
        <TabsContent value="periods">
          <PeriodsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
