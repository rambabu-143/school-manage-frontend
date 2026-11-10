"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Column } from "@/lib/ops/types"

type Row = Record<string, unknown>

export function cellText(v: unknown, kind?: Column["kind"]): string {
  if (v === null || v === undefined || v === "") return "-"
  if (kind === "bool" || typeof v === "boolean") return v ? "Yes" : "No"
  if (kind === "short") return String(v).slice(0, 8)
  if (kind === "datetime" && typeof v === "string") return new Date(v).toLocaleString()
  if (Array.isArray(v)) return `${v.length} item${v.length === 1 ? "" : "s"}`
  if (typeof v === "object") return JSON.stringify(v)
  return String(v)
}

/** Table with loading, error (retry) and empty states. Columns default to the first row's scalar keys. */
export function ResultTable({ rows, columns, isLoading, error, onRetry, empty = "No results.", rowActions }: {
  rows: Row[] | undefined
  columns?: Column[]
  isLoading?: boolean
  error?: string
  onRetry?: () => void
  empty?: string
  rowActions?: (row: Row) => ReactNode
}) {
  if (isLoading) return <div className="space-y-2" aria-busy="true">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-9 w-full" />)}</div>
  if (error) {
    return (
      <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        <span>{error}</span>{onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}
      </div>
    )
  }
  if (!rows?.length) return <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{empty}</p>
  const cols: Column[] = columns ?? Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== "object" || rows[0][k] === null).map((k) => ({ key: k, label: k.replace(/_/g, " ") }))
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader><TableRow>
          {cols.map((c) => <TableHead key={c.key} className="capitalize">{c.label}</TableHead>)}
          {rowActions && <TableHead><span className="sr-only">Actions</span></TableHead>}
        </TableRow></TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={String(r.id ?? i)}>
              {cols.map((c) => <TableCell key={c.key}>{cellText(r[c.key], c.kind)}</TableCell>)}
              {rowActions && <TableCell>{rowActions(r)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
