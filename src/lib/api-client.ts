"use client"

import axios from "axios"

// Client components talk to /api/backend/*, never the backend directly - the
// Next.js Route Handler attaches the httpOnly-cookie access token server-side.
export const apiClient = axios.create({
  baseURL: "/api/backend",
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        // Outside a component here (axios interceptor) - no useRouter available.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)
