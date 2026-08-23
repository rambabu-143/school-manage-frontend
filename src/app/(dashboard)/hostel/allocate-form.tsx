"use client"

import * as React from "react"
import { Loader2, Trash2 } from "lucide-react"

import { HostelRoomSelect } from "@/components/hostel-room-select"
import { HostelSelect } from "@/components/hostel-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useHostelRooms } from "@/hooks/use-hostel-rooms"
import { useHostels } from "@/hooks/use-hostels"
import {
  useAssignStudentHostel,
  useRemoveStudentHostel,
  useStudentHostel,
} from "@/hooks/use-student-hostel"

export function AllocateForm({ studentId }: { studentId: string }) {
  const { data: allocationRow, isPending } = useStudentHostel(studentId)
  const { data: hostels } = useHostels()

  // Same soft-deactivate-and-reuse pattern as transport: the backend keeps
  // one row per student and GET returns it regardless of is_active, so only
  // treat it as a live allocation when is_active is true.
  const allocation = allocationRow?.is_active ? allocationRow : null

  const [hostelId, setHostelId] = React.useState<string>()
  const [roomId, setRoomId] = React.useState<string>()
  const [bedNumber, setBedNumber] = React.useState("")

  const { data: rooms } = useHostelRooms()
  const currentRoom = rooms?.find((r) => r.id === allocation?.room_id)
  const currentHostel = hostels?.find((h) => h.id === currentRoom?.hostel_id)

  const assign = useAssignStudentHostel()
  const remove = useRemoveStudentHostel()

  if (isPending) return <p className="text-sm text-muted-foreground">Loading...</p>

  return (
    <div className="flex flex-col gap-4">
      {allocation ? (
        <div className="flex items-center justify-between rounded-md border p-3 text-sm">
          <div>
            <div className="font-medium">
              {currentHostel?.name ?? "—"} · Room {currentRoom?.room_number ?? "—"}
            </div>
            <div className="text-muted-foreground">Bed: {allocation.bed_number ?? "—"}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={remove.isPending}
            onClick={() => remove.mutate(studentId)}
          >
            {remove.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Remove
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No hostel allocation yet.</p>
      )}

      <Separator />

      <div className="flex flex-col gap-3">
        <Label>{allocation ? "Reassign" : "Assign"}</Label>
        <HostelSelect
          value={hostelId}
          onChange={(value) => {
            setHostelId(value)
            setRoomId(undefined)
          }}
        />
        <HostelRoomSelect hostelId={hostelId} value={roomId} onChange={setRoomId} />
        <Input
          type="number"
          min={1}
          placeholder="Bed number (optional)"
          value={bedNumber}
          onChange={(e) => setBedNumber(e.target.value)}
        />
        <Button
          disabled={!roomId || assign.isPending}
          onClick={() => {
            if (!roomId) return
            assign.mutate(
              { studentId, roomId, bedNumber: bedNumber ? Number(bedNumber) : undefined },
              {
                onSuccess: () => {
                  setHostelId(undefined)
                  setRoomId(undefined)
                  setBedNumber("")
                },
              }
            )
          }}
        >
          {assign.isPending && <Loader2 className="animate-spin" />}
          {allocation ? "Reassign" : "Assign"}
        </Button>
      </div>
    </div>
  )
}
