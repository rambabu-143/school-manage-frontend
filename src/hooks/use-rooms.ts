"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { Room, RoomCreateInput } from "@/types/rooms"

export function useRooms(branchId?: string) {
  return useQuery({
    queryKey: ["rooms", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<Room[]>("/rooms", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RoomCreateInput) => {
      const { data } = await apiClient.post<Room>("/rooms", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      toast.success("Room added")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
