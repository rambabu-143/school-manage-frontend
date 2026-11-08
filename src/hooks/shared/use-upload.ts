"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import axios from "axios"

import { apiClient } from "@/lib/api-client"
import { parseApiError, type ParsedApiError } from "@/lib/shared/api-error"
import { validateCsvRows, validateFile, type FileRule } from "@/lib/shared/file-validation"

/**
 * Multipart upload through the BFF (/api/backend/*). Progress is browser->BFF bytes.
 *   const up = useUpload<ImportResult>({ path: "/bulk-import/students", rule: CSV_RULE })
 *   await up.upload(file)
 */
export function useUpload<T = unknown>({
  path,
  rule,
  field = "file",
  extraFields,
}: {
  path: string
  rule: FileRule
  field?: string
  extraFields?: Record<string, string>
}) {
  const ctrl = useRef<AbortController | null>(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setUploading] = useState(false)
  const [error, setError] = useState<ParsedApiError | null>(null)
  const [data, setData] = useState<T | null>(null)
  const [cancelled, setCancelled] = useState(false)

  // abort an in-flight upload when the component goes away
  useEffect(() => () => ctrl.current?.abort(), [])

  const reset = useCallback(() => {
    setProgress(0)
    setError(null)
    setData(null)
    setCancelled(false)
  }, [])

  const cancel = useCallback(() => ctrl.current?.abort(), [])

  const upload = useCallback(
    async (file: File): Promise<T | null> => {
      reset()
      const invalid = validateFile(file, rule)
      if (invalid) {
        setError({ status: null, kind: "validation", message: invalid, fieldErrors: {}, rowErrors: [], retryAfter: null })
        return null
      }
      if (rule.maxRows !== undefined) {
        const tooMany = validateCsvRows(await file.slice(0, rule.maxBytes).text(), rule)
        if (tooMany) {
          setError({ status: null, kind: "validation", message: tooMany, fieldErrors: {}, rowErrors: [], retryAfter: null })
          return null
        }
      }
      const form = new FormData()
      form.append(field, file)
      for (const [k, v] of Object.entries(extraFields ?? {})) form.append(k, v)
      ctrl.current = new AbortController()
      setUploading(true)
      try {
        // Content-Type left unset so the browser adds the multipart boundary.
        const res = await apiClient.post<T>(path, form, {
          signal: ctrl.current.signal,
          headers: { "Content-Type": undefined },
          onUploadProgress: (e) => setProgress(e.total ? Math.round((e.loaded / e.total) * 100) : 0),
        })
        setProgress(100)
        setData(res.data)
        return res.data
      } catch (e) {
        if (axios.isCancel(e)) setCancelled(true)
        else setError(parseApiError(e))
        return null
      } finally {
        setUploading(false)
      }
    },
    [path, rule, field, extraFields, reset]
  )

  return { upload, cancel, reset, progress, isUploading, error, data, cancelled }
}
