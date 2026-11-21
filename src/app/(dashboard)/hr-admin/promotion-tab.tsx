"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { Field } from "@/components/hr/pickers"
import { RowsTable } from "@/components/hr/rows-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { PROMOTIONS, usePromoteGrades, useRunPromotion, useStaffGradePreview } from "@/hooks/use-hr-admin"

export function PromotionTab() {
  const [src, setSrc] = React.useState<string>()
  const [dst, setDst] = React.useState<string>()
  const [pending, setPending] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<unknown>(null)
  const preview = useStaffGradePreview(src)
  const grades = usePromoteGrades()
  const promo = useRunPromotion()
  const ok = !!src && !!dst && src !== dst
  const busy = grades.isPending || promo.isPending
  const label = pending === "grades" ? "Staff grades" : pending ? PROMOTIONS[pending as keyof typeof PROMOTIONS].label : ""

  function confirm() {
    if (!ok || !pending) return
    const body = { source_academic_year_id: src!, target_academic_year_id: dst! }
    const done = (r: unknown) => { setResult(r); setPending(null) }
    if (pending === "grades") grades.mutate(body, { onSuccess: done, onError: () => setPending(null) })
    else promo.mutate(() => PROMOTIONS[pending as keyof typeof PROMOTIONS].run(body), { onSuccess: done, onError: () => setPending(null) })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Field label="From academic year"><AcademicYearSelect value={src} onChange={setSrc} /></Field>
        <Field label="To academic year"><AcademicYearSelect value={dst} onChange={setDst} /></Field>
      </div>
      {src && dst && src === dst && <p role="alert" className="text-sm text-destructive">Source and target years must differ.</p>}
      <div className="flex flex-wrap gap-2">
        <Button disabled={!ok || busy} onClick={() => setPending("grades")}>Promote staff grades</Button>
        {Object.entries(PROMOTIONS).map(([k, v]) => <Button key={k} variant="outline" disabled={!ok || busy} onClick={() => setPending(k)}>Promote {v.label.toLowerCase()}</Button>)}
      </div>
      {result != null && (
        <pre className="max-h-64 overflow-auto rounded-md border bg-muted p-3 text-xs" aria-label="Promotion result">{JSON.stringify(result, null, 2)}</pre>
      )}
      {src && <section className="flex flex-col gap-2"><h2 className="font-medium">Staff grade preview (source year)</h2>
        <RowsTable rows={preview.data} isLoading={preview.isPending} error={preview.error} onRetry={() => preview.refetch()} empty="Nothing to promote." /></section>}
      <ConfirmDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)} isPending={busy} confirmLabel="Run promotion"
        title={`Promote ${label.toLowerCase()}?`}
        description="This copies data from the source year into the target year for the whole school. It is recorded in the audit log."
        onConfirm={confirm} />
    </div>
  )
}
