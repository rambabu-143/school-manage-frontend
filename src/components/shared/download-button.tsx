"use client"

import { Download, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useDownload } from "@/hooks/shared/use-download"

interface DownloadButtonProps extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  path: string
  params?: Record<string, unknown>
  fallbackName?: string
  /** Open in a new tab (PDF preview) instead of saving. */
  open?: boolean
  /** When set the request is a POST with this JSON body. */
  body?: unknown
}

export function DownloadButton({ path, params, fallbackName, open, body, children = "Download", ...props }: DownloadButtonProps) {
  const { download, isLoading } = useDownload()
  return (
    <Button type="button" variant="outline" {...props} disabled={isLoading || props.disabled} onClick={() => download(path, { params, fallbackName, open, body })}>
      {isLoading ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />}
      {children}
    </Button>
  )
}
