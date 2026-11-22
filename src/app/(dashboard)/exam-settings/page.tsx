"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { BluesheetSettingsTab } from "./bluesheet-tab"
import { GradeSettingsTab } from "./grade-tab"
import { WeightagesTab } from "./weightage-tab"

export default function ExamSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Exam Settings</h1>
        <p className="text-sm text-muted-foreground">Grade bands, plus senior weightages and bluesheet columns. The server validates references and is the final authority.</p>
      </div>
      <Tabs defaultValue="grade-settings">
        <TabsList>
          <TabsTrigger value="grade-settings">Grade bands</TabsTrigger>
          <TabsTrigger value="weightages">Senior weightages</TabsTrigger>
          <TabsTrigger value="bluesheet-settings">Bluesheet settings</TabsTrigger>
        </TabsList>
        <TabsContent value="grade-settings"><GradeSettingsTab /></TabsContent>
        <TabsContent value="weightages"><WeightagesTab /></TabsContent>
        <TabsContent value="bluesheet-settings"><BluesheetSettingsTab /></TabsContent>
      </Tabs>
    </div>
  )
}
