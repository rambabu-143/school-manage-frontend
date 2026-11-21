"use client"

import * as React from "react"

import { RowsTable } from "@/components/hr/rows-table"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useEmployeeMaster, useHrDashboard } from "@/hooks/use-hr-admin"
import { humanize } from "@/lib/hr/rows"
import { parseApiError } from "@/lib/shared/api-error"

export function OverviewTab() {
  const dash = useHrDashboard()
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])
  const emp = useEmployeeMaster({ search: debounced || undefined })

  return (
    <div className="flex flex-col gap-6">
      {dash.isError ? (
        <p role="alert" className="text-sm text-destructive">{parseApiError(dash.error).message}</p>
      ) : (
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {dash.isPending
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)
            : Object.entries(dash.data).map(([k, v]) => (
                <div key={k} className="rounded-md border p-3">
                  <dt className="text-xs text-muted-foreground">{humanize(k)}</dt>
                  <dd className="text-2xl font-semibold">{String(v)}</dd>
                </div>
              ))}
        </dl>
      )}
      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Employee master</h2>
        <Input className="max-w-sm" placeholder="Search by name or number" aria-label="Search employees" value={search} onChange={(e) => setSearch(e.target.value)} />
        <RowsTable rows={emp.data} isLoading={emp.isPending} error={emp.error} onRetry={() => emp.refetch()} empty="No employees found." />
      </section>
    </div>
  )
}
