"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AssignTab } from "./assign-tab"
import { HousesTab } from "./houses-tab"
import { LeaderboardTab } from "./leaderboard-tab"
import { PointsTab } from "./points-tab"

export default function HousesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Houses</h1>
        <p className="text-sm text-muted-foreground">
          Houses, student membership, points, and the leaderboard.
        </p>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="points">Points</TabsTrigger>
          <TabsTrigger value="houses">Houses</TabsTrigger>
          <TabsTrigger value="assign">Student Assignment</TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard">
          <LeaderboardTab />
        </TabsContent>
        <TabsContent value="points">
          <PointsTab />
        </TabsContent>
        <TabsContent value="houses">
          <HousesTab />
        </TabsContent>
        <TabsContent value="assign">
          <AssignTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
