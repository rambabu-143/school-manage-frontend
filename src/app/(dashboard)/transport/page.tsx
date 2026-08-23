"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AssignTab } from "./assign-tab"
import { RoutesTab } from "./routes-tab"
import { SlabsTab } from "./slabs-tab"
import { StopsTab } from "./stops-tab"

export default function TransportPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Transport</h1>
        <p className="text-sm text-muted-foreground">
          Routes, fare slabs, stops, and student assignment.
        </p>
      </div>

      <Tabs defaultValue="routes">
        <TabsList>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="slabs">Fare Slabs</TabsTrigger>
          <TabsTrigger value="stops">Stops</TabsTrigger>
          <TabsTrigger value="assign">Student Assignment</TabsTrigger>
        </TabsList>
        <TabsContent value="routes">
          <RoutesTab />
        </TabsContent>
        <TabsContent value="slabs">
          <SlabsTab />
        </TabsContent>
        <TabsContent value="stops">
          <StopsTab />
        </TabsContent>
        <TabsContent value="assign">
          <AssignTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
