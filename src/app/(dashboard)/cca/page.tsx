"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ActivitiesTab } from "./activities-tab"
import { GradingTab } from "./grading-tab"
import { IndicatorsTab } from "./indicators-tab"
import { ReportCardTab } from "./report-card-tab"

export default function CcaPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Co-Curricular Activities</h1>
        <p className="text-sm text-muted-foreground">
          Activities, their graded indicators, and per-student grades.
        </p>
      </div>

      <Tabs defaultValue="grading">
        <TabsList>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="indicators">Indicators</TabsTrigger>
          <TabsTrigger value="grading">Grading</TabsTrigger>
          <TabsTrigger value="report-card">Report Card</TabsTrigger>
        </TabsList>
        <TabsContent value="activities">
          <ActivitiesTab />
        </TabsContent>
        <TabsContent value="indicators">
          <IndicatorsTab />
        </TabsContent>
        <TabsContent value="grading">
          <GradingTab />
        </TabsContent>
        <TabsContent value="report-card">
          <ReportCardTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
