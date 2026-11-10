"use client"

import * as React from "react"

import { GradeSelect } from "@/components/grade-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useMcopLoginReport } from "@/hooks/use-mcop-login-report"
import { errorMessage } from "@/lib/error-message"

const FILTERS = ["ALL", "ACTIVE", "INACTIVE", "DOES NOT EXIST", "NOT LOGIN FOR 15", "NOT LOGIN FOR 30"] as const
const LIMIT = 50

export default function McopLoginPage() {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("ALL")
  const [name, setName] = React.useState("")
  const [gradeId, setGradeId] = React.useState<string>()
  const [page, setPage] = React.useState(0)
  const [debouncedName, setDebouncedName] = React.useState("")
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedName(name.trim()), 300)
    return () => clearTimeout(t)
  }, [name])
  const q = useMcopLoginReport({ filter, name: debouncedName || null, grade_id: gradeId ?? null, limit: LIMIT, offset: page * LIMIT })
  const rows = q.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">MCOP login report</h1>
        <p className="text-sm text-muted-foreground">Which students have a parent portal account and when they last signed in.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="mcop-name">Name</Label>
          <Input id="mcop-name" value={name} onChange={(e) => { setName(e.target.value); setPage(0) }} className="w-52" />
        </div>
        <div className="w-44 space-y-1">
          <Label>Grade</Label>
          <GradeSelect value={gradeId} onChange={(v) => { setGradeId(v); setPage(0) }} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mcop-filter">Status</Label>
          <select
            id="mcop-filter"
            className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            value={filter}
            onChange={(e) => { setFilter(e.target.value as (typeof FILTERS)[number]); setPage(0) }}
          >
            {FILTERS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
      </div>

      {q.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : q.isError ? (
        <p role="alert" className="text-sm text-destructive">{errorMessage(q.error)}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No students match.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead><tr className="text-left"><th className="p-2">Admission no.</th><th>Name</th><th>Class</th><th>Account</th><th>Last active</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student_id} className="border-t">
                  <td className="p-2">{r.admission_number}</td>
                  <td>{r.name}</td>
                  <td>{[r.grade_name, r.section_name].filter(Boolean).join(" ")}</td>
                  <td><Badge variant="secondary">{r.mcop_account_status}</Badge></td>
                  <td>{r.last_active_label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <span className="text-sm">Page {page + 1}</span>
        <Button variant="outline" size="sm" disabled={rows.length < LIMIT} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  )
}
