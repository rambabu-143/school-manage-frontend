"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CombinationsTab } from "./combinations-tab"
import { SelectionsTab } from "./selections-tab"
import { StreamsTab } from "./streams-tab"

export default function StreamsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Streams</h1>
        <p className="text-sm text-muted-foreground">
          Streams, subject combinations, and student stream selection.
        </p>
      </div>

      <Tabs defaultValue="selections">
        <TabsList>
          <TabsTrigger value="selections">Student Selections</TabsTrigger>
          <TabsTrigger value="combinations">Combinations</TabsTrigger>
          <TabsTrigger value="streams">Streams</TabsTrigger>
        </TabsList>
        <TabsContent value="selections">
          <SelectionsTab />
        </TabsContent>
        <TabsContent value="combinations">
          <CombinationsTab />
        </TabsContent>
        <TabsContent value="streams">
          <StreamsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
