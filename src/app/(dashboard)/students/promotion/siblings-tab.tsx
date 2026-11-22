"use client"

import * as React from "react"

import { SectionSelect } from "@/components/section-select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useSiblingStudents, useUpdateSibling } from "@/hooks/use-session-promotion"
import { toggleId } from "@/lib/hr/rows"
import { errorMessage } from "@/lib/error-message"
import { buildSiblingBody, linkSiblings, summarizeResult, unlinkSibling, type SiblingMap } from "@/lib/promotion-payloads"

import { OpCard } from "./op-card"

export function SiblingsTab() {
  const [sectionId, setSectionId] = React.useState<string>()
  const list = useSiblingStudents(sectionId)
  const update = useUpdateSibling()
  const rows = React.useMemo(() => list.data ?? [], [list.data])
  const original = React.useMemo<SiblingMap>(() => Object.fromEntries(rows.map((r) => [r.student_id, r.siblings.map((s) => s.student_id)])), [rows])
  const [draft, setDraft] = React.useState<SiblingMap>({})
  const [picked, setPicked] = React.useState<string[]>([])
  const cur = { ...original, ...draft }
  const body = buildSiblingBody(original, cur)
  const label = (id: string) => {
    const r = rows.find((x) => x.student_id === id)
    if (r) return `${r.first_name} ${r.last_name}`
    return rows.flatMap((x) => x.siblings).find((s) => s.student_id === id)?.admission_number ?? id
  }

  function changeSection(v: string) {
    setSectionId(v)
    setDraft({})
    setPicked([])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-sm space-y-1"><Label>Section</Label><SectionSelect value={sectionId} onChange={changeSection} /></div>
      {!sectionId ? <p className="text-sm text-muted-foreground">Select a section to list students and their siblings.</p>
        : list.isPending ? <Skeleton className="h-40 w-full" />
        : list.isError ? <p role="alert" className="text-sm text-destructive">{errorMessage(list.error)}</p>
        : rows.length === 0 ? <p className="text-sm text-muted-foreground">No students in this section.</p>
        : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead><tr className="text-left"><th className="p-2" /><th>Admission no.</th><th>Name</th><th>Siblings</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.student_id} className="border-t align-top">
                    <td className="p-2"><input type="checkbox" aria-label={`Select ${r.first_name} ${r.last_name}`} checked={picked.includes(r.student_id)} onChange={() => setPicked((p) => toggleId(p, r.student_id))} /></td>
                    <td>{r.admission_number}</td>
                    <td>{r.first_name} {r.last_name}</td>
                    <td className="space-x-2">
                      {(cur[r.student_id] ?? []).length === 0 && "-"}
                      {(cur[r.student_id] ?? []).map((sid) => (
                        <span key={sid} className="inline-flex items-center gap-1 rounded border px-1.5">
                          {label(sid)}
                          <button type="button" aria-label={`Unlink ${label(sid)}`} className="text-destructive" onClick={() => setDraft(unlinkSibling(cur, r.student_id, sid))}>x</button>
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      <div><Button variant="outline" disabled={picked.length < 2} onClick={() => { setDraft(linkSiblings(cur, picked)); setPicked([]) }}>Link {picked.length || ""} selected as siblings</Button></div>
      <OpCard title="Save sibling changes" description="Replaces the sibling set of every changed student (links are written both ways)." countLabel={`${body?.students.length ?? 0} student(s)`}
        ready={!!body} isPending={update.isPending} error={update.error} result={update.data}
        onRun={() => body && update.mutate(body, { onSuccess: (r) => { if (!summarizeResult(r).skipped.length) setDraft({}) }, })}>
        <p className="text-sm text-muted-foreground">{body ? `${body.students.length} student(s) changed.` : "No pending changes."}</p>
      </OpCard>
    </div>
  )
}
