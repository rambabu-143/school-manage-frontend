"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { HouseSelect } from "@/components/house-select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useHouses } from "@/hooks/use-houses"
import { useAssignStudentHouse, useStudentHouse } from "@/hooks/use-student-house"

export function AssignForm({ studentId }: { studentId: string }) {
  const { data: membership, isPending } = useStudentHouse(studentId)
  const { data: houses } = useHouses()
  const [houseId, setHouseId] = React.useState<string>()
  const assign = useAssignStudentHouse()

  const currentHouse = houses?.find((h) => h.id === membership?.house_id)

  if (isPending) return <p className="text-sm text-muted-foreground">Loading...</p>

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Current house: <span className="font-medium text-foreground">{currentHouse?.name ?? "None"}</span>
      </p>
      <Label>{membership ? "Reassign" : "Assign"}</Label>
      <HouseSelect value={houseId} onChange={setHouseId} />
      <Button
        disabled={!houseId || assign.isPending}
        onClick={() => {
          if (!houseId) return
          assign.mutate({ studentId, houseId }, { onSuccess: () => setHouseId(undefined) })
        }}
      >
        {assign.isPending && <Loader2 className="animate-spin" />}
        {membership ? "Reassign" : "Assign"}
      </Button>
    </div>
  )
}
