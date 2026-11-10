"use client"

import { ReportPage } from "@/components/ops/report-page"
import { ResourcePage } from "@/components/ops/resource-page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RESOURCES, SHOOTING_CLASSWISE } from "@/lib/ops/resources"

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Shooting</h1>
      <Tabs defaultValue="slots">
        <TabsList className="flex-wrap">
          <TabsTrigger value="slots">Slots</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="golive">Class go-live</TabsTrigger>
          <TabsTrigger value="student">Student go-live</TabsTrigger>
          <TabsTrigger value="classwise">Class-wise view</TabsTrigger>
        </TabsList>
        <TabsContent value="slots" className="pt-4"><ResourcePage res={RESOURCES.shootingSlots} /></TabsContent>
        <TabsContent value="applications" className="pt-4"><ResourcePage res={RESOURCES.shootingApplications} /></TabsContent>
        <TabsContent value="golive" className="pt-4"><ResourcePage res={RESOURCES.shootingGolive} /></TabsContent>
        <TabsContent value="student" className="pt-4"><ResourcePage res={RESOURCES.shootingStudentGolive} /></TabsContent>
        <TabsContent value="classwise" className="pt-4"><ReportPage title="Class-wise go-live" reports={SHOOTING_CLASSWISE} /></TabsContent>
      </Tabs>
    </div>
  )
}
