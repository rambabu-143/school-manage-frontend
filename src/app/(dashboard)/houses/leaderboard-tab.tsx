"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { Label } from "@/components/ui/label"
import { useHouseLeaderboard } from "@/hooks/use-houses"

export function LeaderboardTab() {
  const [academicYearId, setAcademicYearId] = React.useState<string>()
  const { data: leaderboard, isPending } = useHouseLeaderboard(academicYearId)

  const maxPoints = Math.max(1, ...(leaderboard?.houses.map((h) => h.total_points) ?? [1]))

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-sm flex flex-col gap-2">
        <Label>Academic year</Label>
        <AcademicYearSelect value={academicYearId} onChange={setAcademicYearId} />
      </div>

      {!academicYearId ? (
        <p className="text-sm text-muted-foreground">Select an academic year to view rankings.</p>
      ) : isPending ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {leaderboard?.houses.map((house, index) => (
            <div key={house.house_id} className="flex items-center gap-3">
              <span className="w-6 text-sm font-medium text-muted-foreground">#{index + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{house.house_name}</span>
                  <span className="text-muted-foreground">{house.total_points} pts</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(house.total_points / maxPoints) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
