"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type {
  BoardOfDirector,
  BoardOfDirectorCreateInput,
  BoardOfDirectorUpdateInput,
  Notice,
  NoticeCreateInput,
} from "@/types/notices"

export function useNotices() {
  return useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data } = await apiClient.get<Notice[]>("/notices")
      return data
    },
  })
}

export function useCreateNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: NoticeCreateInput) => {
      const { data } = await apiClient.post<Notice>("/notices", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] })
      toast.success("Notice posted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useBoardOfDirectors(activeOnly?: boolean) {
  return useQuery({
    queryKey: ["board-of-directors", { activeOnly }],
    queryFn: async () => {
      const { data } = await apiClient.get<BoardOfDirector[]>("/board-of-directors", {
        params: activeOnly ? { active_only: true } : undefined,
      })
      return data
    },
  })
}

export function useCreateBoardOfDirector() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: BoardOfDirectorCreateInput) => {
      const { data } = await apiClient.post<BoardOfDirector>("/board-of-directors", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-of-directors"] })
      toast.success("Board member added")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdateBoardOfDirector() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: BoardOfDirectorUpdateInput }) => {
      const { data } = await apiClient.put<BoardOfDirector>(`/board-of-directors/${id}`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-of-directors"] })
      toast.success("Board member updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
