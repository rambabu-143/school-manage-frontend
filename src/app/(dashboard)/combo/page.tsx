"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AssignTab } from "./assign-tab"
import { CombosTab } from "./combos-tab"
import { PromoteTab } from "./promote-tab"

export default function ComboPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Elective Combos</h1>
        <p className="text-sm text-muted-foreground">
          Subject combinations (e.g. PCM, PCB), student assignment, and year-end promotion.
        </p>
      </div>

      <Tabs defaultValue="combos">
        <TabsList>
          <TabsTrigger value="combos">Combos</TabsTrigger>
          <TabsTrigger value="assign">Student Assignment</TabsTrigger>
          <TabsTrigger value="promote">Promote</TabsTrigger>
        </TabsList>
        <TabsContent value="combos">
          <CombosTab />
        </TabsContent>
        <TabsContent value="assign">
          <AssignTab />
        </TabsContent>
        <TabsContent value="promote">
          <PromoteTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
