"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { ModuleKey, ModuleSetting } from "@/types/moduleaccess"

export function useModuleSettings() {
  return useQuery({
    queryKey: ["module-settings"],
    queryFn: async () => {
      const { data } = await apiClient.get<ModuleSetting[]>("/module-settings")
      return data
    },
  })
}

export function useSetModuleEnabled() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ moduleKey, isEnabled }: { moduleKey: ModuleKey; isEnabled: boolean }) => {
      const { data } = await apiClient.put<ModuleSetting>(`/module-settings/${moduleKey}`, {
        is_enabled: isEnabled,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module-settings"] })
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
