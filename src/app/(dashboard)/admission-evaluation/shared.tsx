"use client"

import * as React from "react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { AdmissionRoom, Scope } from "@/hooks/use-admission-evaluation"
import { errorMessage } from "@/lib/error-message"

export type EvalCtx = { scope: Scope; gradeId?: string; className?: string; phase: number }

export const regName = (r: { personal_details?: { name?: string } | null; registration_no?: string | null }) => r.personal_details?.name ?? "(no name)"

export const roomLabel = (r: AdmissionRoom) => `${r.room_no} (${r.shift}, phase ${r.phase})`

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  confirmLabel: string
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function QueryState({ q, needs }: { q: { isPending: boolean; isError: boolean; error: unknown; fetchStatus: string }; needs: string }) {
  if (q.fetchStatus === "idle" && q.isPending) return <p className="text-sm text-muted-foreground">{needs}</p>
  if (q.isPending) return <Skeleton className="h-32 w-full" />
  // Other-branch or unknown ids come back as 404; the backend message is shown as is.
  if (q.isError) return <p role="alert" className="text-sm text-destructive">{errorMessage(q.error)}</p>
  return null
}
