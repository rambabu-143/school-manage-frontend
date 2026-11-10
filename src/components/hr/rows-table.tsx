"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { parseApiError } from "@/lib/shared/api-error"
import { cellText, columnKeys, humanize, type Row } from "@/lib/hr/rows"

interface Props<T extends object> {
  rows: readonly T[] | undefined
  isLoading?: boolean
  error?: unknown
  onRetry?: () => void
  empty?: string
  /** Override auto columns. */
  columns?: ColumnDef<T, unknown>[]
}

/** Table for endpoints that return free-form objects: columns come from the data. Has error + empty + loading states. */
export function RowsTable<T extends object>({ rows, isLoading, error, onRetry, empty = "Nothing to show.", columns }: Props<T>) {
  if (error) {
    return (
      <div role="alert" className="flex items-center justify-between gap-3 rounded-md border border-destructive/40 p-3 text-sm">
        <span>{parseApiError(error).message}</span>
        {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}
      </div>
    )
  }
  const data = (rows ?? []) as T[]
  const cols =
    columns ??
    columnKeys(data as unknown as Row[]).map<ColumnDef<T, unknown>>((k) => ({
      id: k,
      header: humanize(k),
      cell: ({ row }) => cellText((row.original as Row)[k]),
    }))
  return <DataTable columns={cols} data={data} isLoading={isLoading} emptyMessage={empty} />
}
