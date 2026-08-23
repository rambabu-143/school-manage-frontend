"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { HostelRoom, HostelRoomCreateInput, RoomOccupant } from "@/types/hostel"

export function useHostelRooms(hostelId?: string) {
  return useQuery({
    queryKey: ["hostel-rooms", { hostelId }],
    queryFn: async () => {
      const { data } = await apiClient.get<HostelRoom[]>("/hostel-rooms", {
        params: hostelId ? { hostel_id: hostelId } : undefined,
      })
      return data
    },
  })
}

export function useCreateHostelRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: HostelRoomCreateInput) => {
      const { data } = await apiClient.post<HostelRoom>("/hostel-rooms", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostel-rooms"] })
      toast.success("Room created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useRoomOccupants(roomId: string | undefined) {
  return useQuery({
    queryKey: ["hostel-rooms", roomId, "occupants"],
    queryFn: async () => {
      const { data } = await apiClient.get<RoomOccupant[]>(`/hostel-rooms/${roomId}/occupants`)
      return data
    },
    enabled: !!roomId,
  })
}
