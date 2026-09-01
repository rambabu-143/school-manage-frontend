"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { BoardOfDirectorsTab } from "./board-of-directors-tab"
import { NoticesTab } from "./notices-tab"

export default function NoticesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Notices</h1>
        <p className="text-sm text-muted-foreground">School-wide circulars and announcements.</p>
      </div>

      <Tabs defaultValue="notices">
        <TabsList>
          <TabsTrigger value="notices">Notices</TabsTrigger>
          <TabsTrigger value="board">Board of Directors</TabsTrigger>
        </TabsList>
        <TabsContent value="notices">
          <NoticesTab />
        </TabsContent>
        <TabsContent value="board">
          <BoardOfDirectorsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
