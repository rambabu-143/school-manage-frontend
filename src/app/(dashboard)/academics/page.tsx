"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AcademicYearsTab } from "./academic-years-tab"
import { GradesTab } from "./grades-tab"
import { SectionsTab } from "./sections-tab"

export default function AcademicsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Academics</h1>
        <p className="text-sm text-muted-foreground">
          Academic years, grades, sections, and enrollment.
        </p>
      </div>

      <Tabs defaultValue="years">
        <TabsList>
          <TabsTrigger value="years">Academic Years</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>
        <TabsContent value="years">
          <AcademicYearsTab />
        </TabsContent>
        <TabsContent value="grades">
          <GradesTab />
        </TabsContent>
        <TabsContent value="sections">
          <SectionsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
