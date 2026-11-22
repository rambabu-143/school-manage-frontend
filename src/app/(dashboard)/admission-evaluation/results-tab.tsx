"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEvaluationGrid, useObservationRemark } from "@/hooks/use-admission-evaluation"
import { entryFor } from "@/lib/admission-evaluation"
import { errorMessage } from "@/lib/error-message"

import { QueryState, regName, type EvalCtx } from "./shared"

/** Evaluation grid (present applicants with every subject's marks) plus the per-applicant observation remark. */
export function ResultsTab({ ctx }: { ctx: EvalCtx }) {
  const grid = useEvaluationGrid(ctx.scope, { className: ctx.className, phase: ctx.phase })
  const remark = useObservationRemark()
  const [text, setText] = React.useState<Record<string, string>>({})
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const subjects = grid.data?.subjects ?? []

  const send = (id: string) => {
    const t = (text[id] ?? "").trim()
    if (!t) return
    setBusyId(id)
    remark.mutate({ reg_id: id, remark: t }, {
      onSuccess: () => { toast.success("Remark saved"); setText((s) => ({ ...s, [id]: "" })) },
      onError: (e) => toast.error(errorMessage(e)),
      onSettled: () => setBusyId(null),
    })
  }

  return (
    <div className="space-y-3">
      <QueryState q={grid} needs="Select a class and phase." />
      {grid.isSuccess && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Reg no</th><th className="p-2">Name</th>
                {subjects.map((s) => <th key={s.id} className="p-2">{s.short_name} /{s.max_marks}</th>)}
                <th className="p-2">Total</th><th className="p-2">Observation remark</th>
              </tr>
            </thead>
            <tbody>
              {grid.data.data.length === 0 && <tr><td className="p-2 text-muted-foreground" colSpan={subjects.length + 4}>No present applicants for this class and phase.</td></tr>}
              {grid.data.data.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.registration_no}</td>
                  <td className="p-2">{regName(r)}</td>
                  {subjects.map((s) => <td key={s.id} className="p-2">{String(entryFor(r.marks_details, s.id)?.marks ?? "-")}</td>)}
                  <td className="p-2">{String(r.marks ?? "-")}</td>
                  <td className="flex gap-2 p-2">
                    <Input className="w-48" aria-label={`Remark for ${regName(r)}`} value={text[r.id] ?? ""} disabled={remark.isPending} onChange={(e) => setText((s) => ({ ...s, [r.id]: e.target.value }))} />
                    <Button size="sm" variant="outline" disabled={remark.isPending || !(text[r.id] ?? "").trim()} onClick={() => send(r.id)}>{busyId === r.id ? "Saving..." : "Save"}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
