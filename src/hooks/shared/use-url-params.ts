"use client"

import { useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { parseListParams, patchSearch, type ListParams } from "@/lib/shared/url-params"

/** URL search params as state. `set` replaces history (no back-button spam) and resets page unless given. */
export function useUrlParams() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const set = useCallback(
    (patch: Record<string, string | number | null | undefined>) => {
      const q = patchSearch(new URLSearchParams(sp.toString()), patch)
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
    },
    [sp, router, pathname]
  )
  return { params: sp, get: (k: string) => sp.get(k), set }
}

export function useListParams(defaults?: Partial<ListParams>, allowedSorts: readonly string[] = []): ListParams {
  const sp = useSearchParams()
  const key = sp.toString()
  const d = JSON.stringify(defaults ?? {})
  const a = JSON.stringify(allowedSorts)
  return useMemo(() => parseListParams(new URLSearchParams(key), JSON.parse(d), JSON.parse(a)), [key, d, a])
}
