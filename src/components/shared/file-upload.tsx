"use client"

import { useRef, useState } from "react"
import { FileUp, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUpload } from "@/hooks/shared/use-upload"
import type { FileRule } from "@/lib/shared/file-validation"

interface FileUploadProps<T> {
  /** BFF-relative endpoint, e.g. "/bulk-import/students". */
  path: string
  rule: FileRule
  field?: string
  extraFields?: Record<string, string>
  onSuccess?: (result: T) => void
}

/** Drag/drop + click upload with validation, progress, cancel, and a per-row error report (422 bulk imports). */
export function FileUpload<T = unknown>({ path, rule, field, extraFields, onSuccess }: FileUploadProps<T>) {
  const up = useUpload<T>({ path, rule, field, extraFields })
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  async function run(file: File | undefined) {
    if (!file) return
    const result = await up.upload(file)
    if (result !== null) onSuccess?.(result)
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (!up.isUploading) run(e.dataTransfer.files[0]) }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm transition-colors",
          over ? "border-ring bg-muted" : "border-input"
        )}
      >
        <FileUp className="size-6 text-muted-foreground" aria-hidden />
        <p>Drag a file here or</p>
        <Button type="button" variant="outline" size="sm" disabled={up.isUploading} onClick={() => input.current?.click()}>
          Choose file
        </Button>
        <p className="text-xs text-muted-foreground">{rule.label}</p>
        <input
          ref={input}
          type="file"
          className="sr-only"
          aria-label="Choose file to upload"
          accept={rule.extensions.join(",")}
          onChange={(e) => { run(e.target.files?.[0]); e.target.value = "" }}
        />
      </div>

      {up.isUploading && (
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={up.progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-primary transition-all" style={{ width: `${up.progress}%` }} />
          </div>
          <span className="w-10 text-xs tabular-nums">{up.progress}%</span>
          <Button type="button" variant="ghost" size="icon-sm" onClick={up.cancel} aria-label="Cancel upload">
            <X />
          </Button>
        </div>
      )}

      {up.error && (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <p className="font-medium">{up.error.message}</p>
          {up.error.rowErrors.length > 0 && (
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs">
              {up.error.rowErrors.map((r, i) => (
                <li key={i}>Row {r.row}: {r.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {up.cancelled && <p role="status" className="text-sm text-muted-foreground">Upload cancelled.</p>}
      {up.data !== null && !up.error && <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">Upload complete.</p>}
    </div>
  )
}
