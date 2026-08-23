"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { errorMessage } from "@/lib/error-message"
import type { RouteStudent, TransportRoute, TransportRouteCreateInput } from "@/types/transport"

export function useTransportRoutes(branchId?: string) {
  return useQuery({
    queryKey: ["transport-routes", { branchId }],
    queryFn: async () => {
      const { data } = await apiClient.get<TransportRoute[]>("/transport-routes", {
        params: branchId ? { branch_id: branchId } : undefined,
      })
      return data
    },
  })
}

export function useCreateTransportRoute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TransportRouteCreateInput) => {
      const { data } = await apiClient.post<TransportRoute>("/transport-routes", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-routes"] })
      toast.success("Route created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useRouteStudents(routeId: string | undefined) {
  return useQuery({
    queryKey: ["transport-routes", routeId, "students"],
    queryFn: async () => {
      const { data } = await apiClient.get<RouteStudent[]>(
        `/transport-routes/${routeId}/students`
      )
      return data
    },
    enabled: !!routeId,
  })
}
