"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AllocateTab } from "./allocate-tab"
import { HostelsTab } from "./hostels-tab"
import { RoomsTab } from "./rooms-tab"

export default function HostelPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Hostel</h1>
        <p className="text-sm text-muted-foreground">Hostels, rooms, and student allocation.</p>
      </div>

      <Tabs defaultValue="hostels">
        <TabsList>
          <TabsTrigger value="hostels">Hostels</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="allocate">Student Allocation</TabsTrigger>
        </TabsList>
        <TabsContent value="hostels">
          <HostelsTab />
        </TabsContent>
        <TabsContent value="rooms">
          <RoomsTab />
        </TabsContent>
        <TabsContent value="allocate">
          <AllocateTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
