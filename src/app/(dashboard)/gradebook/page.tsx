"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ExamsTab } from "./exams-tab"
import { MarksEntryTab } from "./marks-entry-tab"
import { ReportCardTab } from "./report-card-tab"
import { SubjectsTab } from "./subjects-tab"

export default function GradebookPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Gradebook</h1>
        <p className="text-sm text-muted-foreground">
          Subjects, exams, marks entry, and report cards.
        </p>
      </div>

      <Tabs defaultValue="marks">
        <TabsList>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="marks">Marks Entry</TabsTrigger>
          <TabsTrigger value="report-card">Report Card</TabsTrigger>
        </TabsList>
        <TabsContent value="subjects">
          <SubjectsTab />
        </TabsContent>
        <TabsContent value="exams">
          <ExamsTab />
        </TabsContent>
        <TabsContent value="marks">
          <MarksEntryTab />
        </TabsContent>
        <TabsContent value="report-card">
          <ReportCardTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
