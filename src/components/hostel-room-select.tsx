"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHostelRooms } from "@/hooks/use-hostel-rooms"

interface HostelRoomSelectProps {
  hostelId: string | undefined
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function HostelRoomSelect({ hostelId, value, onChange, disabled }: HostelRoomSelectProps) {
  const { data: rooms, isPending } = useHostelRooms(hostelId)

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || !hostelId || isPending}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={!hostelId ? "Select a hostel first" : isPending ? "Loading rooms..." : "Select a room"}
        />
      </SelectTrigger>
      <SelectContent>
        {rooms?.map((room) => (
          <SelectItem key={room.id} value={room.id}>
            {room.room_number} (cap {room.capacity})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
