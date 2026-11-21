"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"

type FavouriteMenuList = { menu_keys: string[] }

export function useFavourites() {
  return useQuery({
    queryKey: qk("favourite-menus"),
    queryFn: async () => (await apiClient.get<FavouriteMenuList>("/auth/favourite-menus")).data.menu_keys,
  })
}

/** Idempotent set/unset; the response is the full list, so it replaces the cache. */
export function useMarkFavourite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (v: { menu_key: string; is_favourite: boolean }) =>
      (await apiClient.post<FavouriteMenuList>("/auth/mark-favourite", v)).data.menu_keys,
    onSuccess: (keys) => queryClient.setQueryData(qk("favourite-menus"), keys),
  })
}
