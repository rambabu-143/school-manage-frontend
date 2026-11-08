"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react"

import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useListParams, useUrlParams } from "@/hooks/shared/use-url-params"
import { PAGE_SIZES } from "@/lib/shared/url-params"

interface ServerDataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  rows: TData[] | undefined
  /** Omit when the API returns a bare array: next is enabled while a full page came back. */
  total?: number
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  /** Column ids the server can sort by; their headers become sort buttons. */
  sortable?: string[]
  onRowClick?: (row: TData) => void
  emptyMessage?: string
}

/** page/limit/sort live in the URL (?page&limit&sort&dir); limit is capped at 100. Feed `useListParams(undefined, sortable)` into your query. */
export function ServerDataTable<TData>({
  columns, rows, total, isLoading, error, onRetry, sortable = [], onRowClick, emptyMessage,
}: ServerDataTableProps<TData>) {
  const { page, limit, sort, dir } = useListParams()
  const { set } = useUrlParams()
  const count = rows?.length ?? 0
  const hasNext = total !== undefined ? page * limit < total : count >= limit

  const cols = columns.map((c) => {
    const id = c.id ?? ("accessorKey" in c ? String(c.accessorKey) : "")
    if (!sortable.includes(id) || typeof c.header !== "string") return c
    const label = c.header
    return {
      ...c,
      header: () => (
        <button
          type="button"
          className="inline-flex items-center gap-1 font-medium"
          aria-label={`Sort by ${label}`}
          onClick={() => set(sort === id && dir === "asc" ? { sort: id, dir: "desc" } : { sort: id, dir: "asc" })}
        >
          {label}
          {sort === id && (dir === "asc" ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />)}
        </button>
      ),
    } as ColumnDef<TData, unknown>
  })

  return (
    <div className="space-y-3">
      {error ? (
        <div role="alert" className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <span>{error}</span>
          {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}
        </div>
      ) : (
        <DataTable columns={cols} data={rows ?? []} isLoading={isLoading} onRowClick={onRowClick} emptyMessage={emptyMessage} />
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground" aria-live="polite">
          {total !== undefined ? `${total} total` : `Page ${page}`}
        </span>
        <div className="flex items-center gap-2">
          <Select value={String(limit)} onValueChange={(v) => set({ limit: v })}>
            <SelectTrigger className="w-24" aria-label="Rows per page"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => <SelectItem key={s} value={String(s)}>{s} / page</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1 || isLoading} onClick={() => set({ page: page - 1 })}><ChevronLeft /></Button>
          <Button variant="outline" size="icon" aria-label="Next page" disabled={!hasNext || isLoading} onClick={() => set({ page: page + 1 })}><ChevronRight /></Button>
        </div>
      </div>
    </div>
  )
}
