"use client"

import { useSession } from "@/hooks/use-session"
import { GROUP_ROLES } from "@/lib/comms"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { BoardOfDirectorsTab } from "./board-of-directors-tab"
import { NoticeGroupsTab } from "./notice-groups-tab"
import { NoticesTab } from "./notices-tab"

export default function NoticesPage() {
  const { data: user } = useSession()
  const showGroups = !!user && GROUP_ROLES.includes(user.role)
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Notices</h1>
        <p className="text-sm text-muted-foreground">School-wide circulars and announcements.</p>
      </div>

      <Tabs defaultValue="notices">
        <TabsList>
          <TabsTrigger value="notices">Notices</TabsTrigger>
          {showGroups && <TabsTrigger value="groups">Groups</TabsTrigger>}
          <TabsTrigger value="board">Board of Directors</TabsTrigger>
        </TabsList>
        <TabsContent value="notices">
          <NoticesTab />
        </TabsContent>
        {showGroups && (
          <TabsContent value="groups">
            <NoticeGroupsTab />
          </TabsContent>
        )}
        <TabsContent value="board">
          <BoardOfDirectorsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
