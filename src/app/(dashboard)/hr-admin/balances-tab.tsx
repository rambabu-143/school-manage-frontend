"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { Field } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { StaffSelect } from "@/components/staff-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLeaveTypes, useSaveBalances, useStaffLeaveBalances } from "@/hooks/use-hr-admin"
import { balanceEntries, invalidBalanceKeys, type BalanceCell } from "@/lib/hr/rows"

export function BalancesTab() {
  const [year, setYear] = React.useState<string>()
  const [staff, setStaff] = React.useState<string>()
  const balances = useStaffLeaveBalances(staff, year)
  const types = useLeaveTypes()
  const save = useSaveBalances()
  const [edits, setEdits] = React.useState<Record<string, BalanceCell>>({})
  const [typeId, setTypeId] = React.useState<string>()

  const key = `${staff}:${typeId}`
  // start from the loaded balance: the backend PUT overwrites all three values
  const loaded = balances.data?.find((r) => String(r.leave_type_master_id) === typeId)
  const cell: BalanceCell | undefined = edits[key] ?? (loaded ? {
    carry_forward: String(loaded.carry_forward ?? "0"), credit_in_jan: String(loaded.credit_in_jan ?? "0"), credit_in_july: String(loaded.credit_in_july ?? "0"),
  } : undefined)
  const set = (k: keyof BalanceCell, v: string) => cell && setEdits({ ...edits, [key]: { ...cell, [k]: v } })
  const entries = balanceEntries(edits)
  const invalid = invalidBalanceKeys(edits).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Academic year"><AcademicYearSelect value={year} onChange={setYear} /></Field>
        <Field label="Staff member"><StaffSelect value={staff} onChange={(v) => { setStaff(v); setEdits({}) }} /></Field>
      </div>
      {!year || !staff ? <p className="text-sm text-muted-foreground">Choose a year and a staff member to view balances.</p> : (
        <RowsTable rows={balances.data} isLoading={balances.isPending} error={balances.error} onRetry={() => balances.refetch()} empty="No balances for this staff member." />
      )}
      {year && staff && (
        <form className="flex flex-col gap-3 rounded-md border p-4" onSubmit={(e) => {
          e.preventDefault()
          if (entries.length) save.mutate({ academic_year_id: year, entries }, { onSuccess: () => setEdits({}) })
        }}>
          <h2 className="font-medium">Adjust credits</h2>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Leave type">
              <select aria-label="Leave type" className="h-9 rounded-md border bg-background px-2 text-sm" value={typeId ?? ""} onChange={(e) => setTypeId(e.target.value || undefined)}>
                <option value="">Select</option>
                {types.data?.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
              </select>
            </Field>
            {typeId && cell && (["carry_forward", "credit_in_jan", "credit_in_july"] as const).map((k) => (
              <Field key={k} label={k === "carry_forward" ? "Carry forward" : k === "credit_in_jan" ? "Credit in Jan" : "Credit in Jul"}>
                <Input type="number" min={0} step="0.5" value={cell[k]} onChange={(e) => set(k, e.target.value)} />
              </Field>
            ))}
          </div>
          {typeId && !cell && <p className="text-sm text-muted-foreground">Loading current balance...</p>}
          {invalid > 0 && <p role="alert" className="text-sm text-destructive">{invalid} edited leave type(s) have an empty or negative value and will not be saved.</p>}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!entries.length || save.isPending || balances.isPending}>{save.isPending ? "Saving..." : `Save ${entries.length || ""} change(s)`}</Button>
            <span className="text-xs text-muted-foreground">Changes across leave types accumulate until saved.</span>
          </div>
        </form>
      )}
    </div>
  )
}
