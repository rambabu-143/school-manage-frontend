"use client"

import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStaff } from "@/hooks/use-staff"
import { toggleId } from "@/lib/hr/rows"

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-40 flex-1 flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export function OptionSelect({
  value, onChange, options, placeholder, label,
}: {
  value: string | undefined
  onChange: (v: string) => void
  options: readonly { value: string; label: string }[]
  placeholder: string
  label: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full" aria-label={label}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

/** Searchable multi-select of staff (checkbox list). */
export function StaffChecklist({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const { data: staff, isPending, isError } = useStaff()
  const [q, setQ] = React.useState("")
  const shown = (staff ?? []).filter((s) => `${s.first_name} ${s.last_name} ${s.employee_number}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="flex flex-col gap-2 rounded-md border p-2">
      <Input placeholder="Search staff" aria-label="Search staff" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="max-h-48 overflow-y-auto" role="group" aria-label="Staff">
        {isPending && <p className="p-2 text-sm text-muted-foreground">Loading staff...</p>}
        {isError && <p role="alert" className="p-2 text-sm text-destructive">Could not load staff.</p>}
        {shown.map((s) => (
          <label key={s.id} className="flex items-center gap-2 px-2 py-1 text-sm">
            <Checkbox checked={value.includes(s.id)} onCheckedChange={() => onChange(toggleId(value, s.id))} />
            {s.first_name} {s.last_name} <span className="text-muted-foreground">({s.employee_number})</span>
          </label>
        ))}
        {!isPending && !isError && shown.length === 0 && <p className="p-2 text-sm text-muted-foreground">No staff match.</p>}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{value.length} selected</span>
        <button type="button" className="underline" onClick={() => onChange(shown.map((s) => s.id))}>Select shown</button>
        <button type="button" className="underline" onClick={() => onChange([])}>Clear</button>
      </div>
    </div>
  )
}

export function staffName(staff: { id: string; first_name: string; last_name: string }[] | undefined, id: string | null | undefined) {
  const s = staff?.find((x) => x.id === id)
  return s ? `${s.first_name} ${s.last_name}` : id ? id.slice(0, 8) : "-"
}
