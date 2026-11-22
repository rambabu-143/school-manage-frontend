"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { invalidateWithDependents } from "@/lib/invalidation"
import { qk } from "@/lib/query-keys"
import { errorMessage } from "@/lib/error-message"
import type {
  BoardOfDirector,
  BoardOfDirectorCreateInput,
  BoardOfDirectorUpdateInput,
  Notice,
  NoticeCreateInput,
  NoticeGroup,
  NoticeGroupCreateInput,
  NoticeGroupDetail,
  NoticeGroupUpdateInput,
  NoticeSearchInput,
  NoticeUpdateInput,
} from "@/types/notices"

export function useNotices() {
  return useQuery({
    queryKey: qk("notices"),
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
      invalidateWithDependents(queryClient, "notices")
      toast.success("Notice posted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useNotice(id: string | undefined) {
  return useQuery({
    queryKey: qk("notices", "detail", id),
    enabled: !!id,
    queryFn: async () => (await apiClient.get<Notice>(`/notices/${id}`)).data,
  })
}

export function useNoticeSearch(filters: NoticeSearchInput | null) {
  return useQuery({
    queryKey: qk("notice-search", filters),
    enabled: !!filters,
    queryFn: async () => (await apiClient.post<Notice[]>("/notices/search", filters)).data,
  })
}

export function useUpdateNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: NoticeUpdateInput }) => {
      const { data } = await apiClient.put<Notice>(`/notices/${id}`, input)
      return data
    },
    onSuccess: () => {
      invalidateWithDependents(queryClient, "notices")
      queryClient.invalidateQueries({ queryKey: qk("notice-search") })
      toast.success("Notice updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/notices/${id}`)
    },
    onSuccess: () => {
      invalidateWithDependents(queryClient, "notices")
      queryClient.invalidateQueries({ queryKey: qk("notice-search") })
      toast.success("Notice deleted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useNoticeGroups() {
  return useQuery({
    queryKey: qk("notice-groups"),
    queryFn: async () => (await apiClient.get<NoticeGroup[]>("/notice-groups")).data,
  })
}

export function useNoticeGroupDetail(id: string | undefined) {
  return useQuery({
    queryKey: qk("notice-groups", "detail", id),
    enabled: !!id,
    queryFn: async () => (await apiClient.get<NoticeGroupDetail>(`/notice-groups/${id}/detail`)).data,
  })
}

export function useCreateNoticeGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: NoticeGroupCreateInput) => {
      const { data } = await apiClient.post<NoticeGroup>("/notice-groups", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk("notice-groups") })
      toast.success("Group created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdateNoticeGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: NoticeGroupUpdateInput }) => {
      const { data } = await apiClient.put<NoticeGroup>(`/notice-groups/${id}`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk("notice-groups") })
      toast.success("Group updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteNoticeGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/notice-groups/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk("notice-groups") })
      toast.success("Group deleted")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useBoardOfDirectors(activeOnly?: boolean) {
  return useQuery({
    queryKey: qk("board-of-directors", { activeOnly }),
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
      queryClient.invalidateQueries({ queryKey: qk("board-of-directors") })
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
      queryClient.invalidateQueries({ queryKey: qk("board-of-directors") })
      toast.success("Board member updated")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
