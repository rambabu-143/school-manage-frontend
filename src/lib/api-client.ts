"use client"

import axios from "axios"

import { loginRedirectFor } from "@/lib/session-redirect"

// Client components talk to /api/backend/*, never the backend directly - the
// Next.js Route Handler attaches the httpOnly-cookie access token server-side.
export const apiClient = axios.create({
  baseURL: "/api/backend",
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const to = typeof window !== "undefined" ? loginRedirectFor(window.location.pathname) : null
      if (to) {
        // Outside a component here (axios interceptor) - no useRouter available.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = to
      }
    }
    return Promise.reject(error)
  }
)
