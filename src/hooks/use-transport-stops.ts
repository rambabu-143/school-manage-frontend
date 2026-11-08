"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import { errorMessage } from "@/lib/error-message"
import type { TransportStop, TransportStopCreateInput } from "@/types/transport"

export function useTransportStops(routeId?: string) {
  return useQuery({
    queryKey: qk("transport-stops", { routeId }),
    queryFn: async () => {
      const { data } = await apiClient.get<TransportStop[]>("/transport-stops", {
        params: routeId ? { route_id: routeId } : undefined,
      })
      return data
    },
  })
}

export function useCreateTransportStop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TransportStopCreateInput) => {
      const { data } = await apiClient.post<TransportStop>("/transport-stops", input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk("transport-stops") })
      toast.success("Stop created")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
