"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { qk } from "@/lib/query-keys"
import { api, type ApiBody } from "@/lib/typed-api"

export function useMcopLoginReport(body: ApiBody<"/students/mcop-login-report", "post">) {
  return useQuery({
    queryKey: qk("mcop-login-report", body),
    queryFn: () => api("post", "/students/mcop-login-report", { body }),
    placeholderData: keepPreviousData,
  })
}
