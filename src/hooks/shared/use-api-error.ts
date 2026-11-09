"use client"

import { useCallback } from "react"
import type { FieldValues, Path, UseFormSetError } from "react-hook-form"
import { toast } from "sonner"

import { parseApiError } from "@/lib/shared/api-error"

/**
 * Maps FastAPI errors to user messages + form field errors.
 *   const { handle } = useApiError()
 *   onError: (e) => handle(e, form.setError)
 * Field errors are set on the form; a 409 becomes form.formState.errors.root.server; anything else is toasted.
 */
export function useApiError() {
  const handle = useCallback(
    <T extends FieldValues>(error: unknown, setError?: UseFormSetError<T>) => {
      const parsed = parseApiError(error)
      const entries = Object.entries(parsed.fieldErrors)
      if (setError && entries.length) {
        entries.forEach(([field, message], i) =>
          setError(field as Path<T>, { type: "server", message }, { shouldFocus: i === 0 })
        )
        return parsed
      }
      // conflicts (409) belong to the form as a whole: show inline under root.server
      if (setError && parsed.kind === "conflict") {
        setError("root.server" as Path<T>, { type: "server", message: parsed.message })
        return parsed
      }
      toast.error(parsed.message)
      return parsed
    },
    []
  )
  return { handle, parse: parseApiError }
}
