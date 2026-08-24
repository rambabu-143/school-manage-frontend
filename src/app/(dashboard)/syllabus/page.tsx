"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CoverageTab } from "./coverage-tab"
import { TopicsTab } from "./topics-tab"

export default function SyllabusPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Syllabus</h1>
        <p className="text-sm text-muted-foreground">Planned topics and section coverage.</p>
      </div>

      <Tabs defaultValue="coverage">
        <TabsList>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
        </TabsList>
        <TabsContent value="coverage">
          <CoverageTab />
        </TabsContent>
        <TabsContent value="topics">
          <TopicsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
