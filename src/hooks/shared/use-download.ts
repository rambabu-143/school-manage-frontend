"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import { parseApiError } from "@/lib/shared/api-error"
import { canOpenInline, filenameFromDisposition, safeDownloadName } from "@/lib/shared/download"

/**
 * Fetch a binary (PDF/CSV/...) through the BFF and save it, or open it in a tab (PDF preview).
 *   const { download, isLoading } = useDownload()
 *   download("/students/1/id-card.pdf", { params, fallbackName: "id-card.pdf" })
 */
export function useDownload() {
  const [isLoading, setLoading] = useState(false)

  const download = useCallback(
    async (path: string, opts: { params?: Record<string, unknown>; fallbackName?: string; open?: boolean; body?: unknown } = {}) => {
      setLoading(true)
      try {
        const res =
          opts.body !== undefined
            ? await apiClient.post<Blob>(path, opts.body, { params: opts.params, responseType: "blob" })
            : await apiClient.get<Blob>(path, { params: opts.params, responseType: "blob" })
        const type = res.data.type || String(res.headers["content-type"] ?? "")
        const name = safeDownloadName(
          filenameFromDisposition(res.headers["content-disposition"]) ?? opts.fallbackName ?? null,
          type
        )
        const url = URL.createObjectURL(res.data)
        // only PDFs/images are opened inline; anything else is forced to download
        if (opts.open && canOpenInline(type)) {
          window.open(url, "_blank", "noopener")
        } else {
          const a = document.createElement("a")
          a.href = url
          a.download = name
          document.body.appendChild(a)
          a.click()
          a.remove()
        }
        setTimeout(() => URL.revokeObjectURL(url), 60_000)
        return true
      } catch (e) {
        // blob error bodies are Blobs - decode JSON so the message is the server's
        let err = e
        const response = (e as { response?: { data?: unknown } }).response
        if (response?.data instanceof Blob) {
          try {
            // copy, never mutate the caller's error object
            err = { ...(e as object), response: { ...response, data: JSON.parse(await response.data.text()) } }
          } catch {
            err = e
          }
        }
        toast.error(parseApiError(err).message)
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )
  return { download, isLoading }
}
