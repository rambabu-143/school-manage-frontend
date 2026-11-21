"use client"

import * as React from "react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/error-message"
import { summarizeResult } from "@/lib/promotion-payloads"

interface OpCardProps {
  title: string
  description: string
  /** Shown in the confirm dialog, e.g. "3 grade(s)". */
  countLabel: string
  /** False until the payload builder returned a body. */
  ready: boolean
  isPending: boolean
  error: unknown
  result: unknown
  onRun: () => void
  children: React.ReactNode
}

/** Bulk write card: confirm dialog with counts, submit disabled while pending, backend error + result shown inline. */
export function OpCard({ title, description, countLabel, ready, isPending, error, result, onRun, children }: OpCardProps) {
  const [open, setOpen] = React.useState(false)
  const sum = result ? summarizeResult(result) : null
  return (
    <section className="flex flex-col gap-3 rounded-lg border p-4">
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
      <div><Button disabled={!ready || isPending} onClick={() => setOpen(true)}>{isPending ? "Running..." : title}</Button></div>
      {error != null && <p role="alert" className="text-sm text-destructive">{errorMessage(error)}</p>}
      {sum && (
        <div className="text-sm" aria-label={`${title} result`}>
          <p>{sum.counts.map(([k, n]) => `${k}: ${n}`).join(", ")}</p>
          {sum.skipped.length > 0 && (
            <ul className="list-disc pl-5 text-muted-foreground">
              {sum.skipped.map((s, i) => <li key={`${s.id}-${i}`}>{s.id}: {s.reason}</li>)}
            </ul>
          )}
        </div>
      )}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`${title}?`}
        description={`This bulk operation will run on ${countLabel} and cannot be undone from here.`}
        confirmLabel="Run"
        isPending={isPending}
        onConfirm={() => { onRun(); setOpen(false) }}
      />
    </section>
  )
}

export function Checklist({ items, picked, onToggle, empty }: {
  items: { id: string; label: string }[] | undefined
  picked: readonly string[]
  onToggle: (id: string) => void
  empty: string
}) {
  if (!items?.length) return <p className="text-sm text-muted-foreground">{empty}</p>
  return (
    <div className="grid max-h-48 gap-1 overflow-auto rounded-md border p-2 sm:grid-cols-2">
      {items.map((i) => (
        <label key={i.id} className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={picked.includes(i.id)} onChange={() => onToggle(i.id)} />
          {i.label}
        </label>
      ))}
    </div>
  )
}
