"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import { pollInterval } from "@/lib/query-policy"
import type { Notification } from "@/types/notifications"

export function useNotifications() {
  return useQuery({
    queryKey: qk("notifications"),
    queryFn: async () => {
      const { data } = await apiClient.get<Notification[]>("/notifications")
      return data
    },
    // Paused while the tab is hidden; backs off (x2 up to x8) while failing.
    refetchInterval: (query) =>
      pollInterval(60_000, query.state.fetchFailureCount, typeof document !== "undefined" && document.hidden),
    refetchIntervalInBackground: false,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await apiClient.post<Notification>(
        `/notifications/${notificationId}/read`
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk("notifications") })
    },
  })
}
