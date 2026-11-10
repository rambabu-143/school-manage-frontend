"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { FileUpload } from "@/components/shared/file-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCatsLeaves, useCatsUnits, useMachineAllData } from "@/hooks/use-attendance-admin"
import { qk } from "@/lib/query-keys"
import { CSV_RULE } from "@/lib/shared/file-validation"
import { parseApiError } from "@/lib/shared/api-error"

const KINDS = ["units", "leaves", "employees", "leave-info", "attendance"] as const

function Section({ title, q, children }: { title: string; q: { isPending: boolean; isError: boolean; error: unknown }; children: React.ReactNode }) {
  return (
    <section className="space-y-2" aria-label={title}>
      <h2 className="text-base font-medium">{title}</h2>
      {q.isPending ? <p className="text-sm text-muted-foreground">Loading...</p>
        : q.isError ? <p role="alert" className="text-sm text-destructive">{parseApiError(q.error).message}</p> : children}
    </section>
  )
}

export default function CatsPage() {
  const qc = useQueryClient()
  const [kind, setKind] = useState<(typeof KINDS)[number]>("units")
  const [day, setDay] = useState("")
  const units = useCatsUnits()
  const leaves = useCatsLeaves()
  const machine = useMachineAllData(day || undefined)
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">CATS / biometric data</h1>
        <p className="text-sm text-muted-foreground">Super admin and school admin only. Import is all-or-nothing: any bad row rejects the whole file.</p>
      </div>
      <section className="space-y-2" aria-label="CSV import">
        <h2 className="text-base font-medium">CSV import</h2>
        <div className="w-56 space-y-1">
          <Label htmlFor="cats-kind">Table</Label>
          <select id="cats-kind" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
            {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <FileUpload path={`/hr/cats-reports/import/${kind}`} rule={CSV_RULE} onSuccess={() => qc.invalidateQueries({ queryKey: qk("cats-reports") })} />
      </section>
      <Section title="Units" q={units}>
        <ul className="grid gap-1 text-sm sm:grid-cols-2">{units.data?.map((u) => <li key={u.unit_code}>{u.unit_code} - {u.unit_name}</li>)}{units.data?.length === 0 && <li className="text-muted-foreground">No units imported.</li>}</ul>
      </Section>
      <Section title="Leave types" q={leaves}>
        <ul className="grid gap-1 text-sm sm:grid-cols-2">{leaves.data?.map((l) => <li key={l.leave_code}>{l.leave_code} - {l.leave_name ?? ""}</li>)}{leaves.data?.length === 0 && <li className="text-muted-foreground">No leave types imported.</li>}</ul>
      </Section>
      <section className="space-y-2" aria-label="Machine punches">
        <h2 className="text-base font-medium">Raw machine punches</h2>
        <div className="w-48 space-y-1"><Label htmlFor="mday">Date</Label><Input id="mday" type="date" value={day} onChange={(e) => setDay(e.target.value)} /></div>
        {day && (machine.isPending ? <p className="text-sm text-muted-foreground">Loading...</p>
          : machine.isError ? <p role="alert" className="text-sm text-destructive">{parseApiError(machine.error).message}</p>
          : machine.data.length === 0 ? <p className="text-sm text-muted-foreground">No punches for this day.</p>
          : <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">{JSON.stringify(machine.data, null, 2)}</pre>)}
      </section>
    </div>
  )
}
