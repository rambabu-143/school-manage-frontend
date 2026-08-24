"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AppraisalsTab } from "./appraisals-tab"
import { CyclesTab } from "./cycles-tab"

export default function AppraisalPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Staff Appraisal</h1>
        <p className="text-sm text-muted-foreground">Review cycles and staff appraisals.</p>
      </div>

      <Tabs defaultValue="appraisals">
        <TabsList>
          <TabsTrigger value="appraisals">Appraisals</TabsTrigger>
          <TabsTrigger value="cycles">Cycles</TabsTrigger>
        </TabsList>
        <TabsContent value="appraisals">
          <AppraisalsTab />
        </TabsContent>
        <TabsContent value="cycles">
          <CyclesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
