"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useApiError } from "@/hooks/shared/use-api-error"
import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import { parseApiError } from "@/lib/shared/api-error"

import { Pick, useSectionOptions } from "./pickers"

function QueryState({ q, empty }: { q: { isPending: boolean; isError: boolean; error: unknown; refetch: () => unknown }; empty?: string }) {
  if (q.isPending) return <p className="text-sm text-muted-foreground" role="status">Loading...</p>
  if (q.isError)
    return (
      <div role="alert" className="flex items-center gap-3 text-sm text-destructive">
        {parseApiError(q.error).message}
        <Button size="sm" variant="outline" onClick={() => q.refetch()}>Retry</Button>
      </div>
    )
  return empty ? <p className="text-sm text-muted-foreground">{empty}</p> : null
}

// -- All-remark view (teachers only see their own sections; the API enforces it) ----------------
interface AllRemarkStudent {
  student_id: string; admission_no: string; name: string
  attendance_data: { total_days: number; total_present: number; total_absent: number }
  all_remarks: { term: string; subject_name: string | null; remark: string; is_final: boolean }[]
  final_remark?: string | null
  promoted_to?: { standard: string; section: string } | null
}
export function AllRemarksTab() {
  const sections = useSectionOptions()
  const [sectionId, setSectionId] = useState("")
  const q = useQuery({
    queryKey: qk("exam-records", "all-remark", sectionId),
    enabled: !!sectionId,
    queryFn: async () =>
      (await apiClient.get<{ data: AllRemarkStudent[] }>(`/observation-remarks/all-remark/${sectionId}`, { params: { limit: 500 } })).data.data,
  })
  return (
    <div className="space-y-4">
      <Pick label="Section" value={sectionId} onChange={setSectionId} options={sections.options} loading={sections.isPending} />
      {!sectionId ? <p className="text-sm text-muted-foreground">Choose a section.</p> : <QueryState q={q} empty={q.data?.length === 0 ? "No students in this section." : undefined} />}
      <div className="space-y-3">
        {q.data?.map((s) => (
          <section key={s.student_id} className="rounded-md border p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium">{s.name} <span className="text-muted-foreground">({s.admission_no})</span></h3>
              <span className="text-muted-foreground">Present {s.attendance_data.total_present}/{s.attendance_data.total_days}</span>
            </div>
            <ul className="mt-2 list-disc pl-5">
              {s.all_remarks.map((r, i) => (
                <li key={i}>{r.term}{r.subject_name ? ` - ${r.subject_name}` : ""}: {r.remark} {r.is_final && <Badge variant="secondary">final</Badge>}</li>
              ))}
              {s.all_remarks.length === 0 && <li className="list-none text-muted-foreground">No remarks.</li>}
            </ul>
            {s.promoted_to && <p className="mt-1">Promoted to {s.promoted_to.standard} {s.promoted_to.section}</p>}
          </section>
        ))}
      </div>
    </div>
  )
}

// -- Section locks + academic-record locks + CSA locks -------------------------------------------
interface SectionLock { id: string; lock_key: string; term: string; is_locked: boolean; updated_at: string }
export function SectionLocksTab() {
  const sections = useSectionOptions()
  const qc = useQueryClient()
  const { handle } = useApiError()
  const [sectionId, setSectionId] = useState("")
  const [lockKey, setLockKey] = useState("")
  const [term, setTerm] = useState("")
  const key = qk("exam-records", "section-locks", sectionId)
  const q = useQuery({
    queryKey: key, enabled: !!sectionId,
    queryFn: async () => (await apiClient.get<SectionLock[]>(`/section-locks/${sectionId}`)).data,
  })
  const set = useMutation({
    mutationFn: async (v: { lock_key: string; term: string; is_locked: boolean }) => apiClient.put("/section-locks", { section_id: sectionId, ...v }),
    onSuccess: () => { toast.success("Lock updated"); qc.invalidateQueries({ queryKey: key }) },
    onError: (e) => handle(e),
  })
  return (
    <div className="space-y-4">
      <Pick label="Section" value={sectionId} onChange={setSectionId} options={sections.options} loading={sections.isPending} />
      {sectionId && (
        <>
          <QueryState q={q} empty={q.data?.length === 0 ? "No locks set for this section." : undefined} />
          <ul className="divide-y rounded-md border">
            {q.data?.map((l) => (
              <li key={l.id} className="flex items-center justify-between p-3 text-sm">
                <span>{l.lock_key}{l.term ? ` / ${l.term}` : ""}</span>
                <Switch aria-label={`${l.lock_key} ${l.term} locked`} checked={l.is_locked} disabled={set.isPending}
                  onCheckedChange={(c) => set.mutate({ lock_key: l.lock_key, term: l.term, is_locked: c })} />
              </li>
            ))}
          </ul>
          <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (lockKey) set.mutate({ lock_key: lockKey, term, is_locked: true }) }}>
            <div className="flex flex-col gap-1"><Label htmlFor="lk">Lock key</Label><Input id="lk" value={lockKey} onChange={(e) => setLockKey(e.target.value)} maxLength={100} /></div>
            <div className="flex flex-col gap-1"><Label htmlFor="lt">Term (optional)</Label><Input id="lt" value={term} onChange={(e) => setTerm(e.target.value)} maxLength={50} /></div>
            <Button type="submit" disabled={!lockKey || set.isPending}>Lock</Button>
          </form>
        </>
      )}
    </div>
  )
}

export function RecordLocksForm() {
  const { handle } = useApiError()
  const [studentId, setStudentId] = useState("")
  const [term, setTerm] = useState("Term 1")
  const m = useMutation({
    mutationFn: async (unlock: boolean) => apiClient.post(unlock ? "/academic-record-locks/unlock" : "/academic-record-locks", { student_id: studentId.trim(), term }),
    onSuccess: (_d, unlock) => toast.success(unlock ? "Record unlocked" : "Record locked"),
    onError: (e) => handle(e),
  })
  const ok = studentId.trim().length > 0 && term.length > 0
  return (
    <fieldset className="space-y-3 rounded-md border p-4">
      <legend className="px-1 text-sm font-medium">Academic record lock (per student and term)</legend>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1"><Label htmlFor="rl-s">Student ID</Label><Input id="rl-s" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Student UUID" /></div>
        <div className="flex flex-col gap-1"><Label htmlFor="rl-t">Term</Label><Input id="rl-t" value={term} onChange={(e) => setTerm(e.target.value)} /></div>
        <Button disabled={!ok || m.isPending} onClick={() => m.mutate(false)}>Lock</Button>
        <Button variant="outline" disabled={!ok || m.isPending} onClick={() => m.mutate(true)}>Unlock</Button>
      </div>
    </fieldset>
  )
}

interface CsaEntry { id: string; name: string; sequence: number; lock?: { is_locked: boolean; date: string; time: string } | null }
export function CsaLocksPanel() {
  const sections = useSectionOptions()
  const qc = useQueryClient()
  const { handle } = useApiError()
  const [sectionId, setSectionId] = useState("")
  const key = qk("exam-records", "csa-junior", sectionId)
  const q = useQuery({ queryKey: key, enabled: !!sectionId, queryFn: async () => (await apiClient.get<CsaEntry[]>(`/locked-csa/junior/${sectionId}`)).data })
  const set = useMutation({
    mutationFn: async (v: { head_id: string; is_locked: boolean }) => {
      const now = new Date()
      return apiClient.post("/locked-csa/junior", {
        ...v, section_id: sectionId,
        date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5),
      })
    },
    onSuccess: () => { toast.success("CSA lock updated"); qc.invalidateQueries({ queryKey: key }) },
    onError: (e) => handle(e),
  })
  return (
    <fieldset className="space-y-3 rounded-md border p-4">
      <legend className="px-1 text-sm font-medium">Junior CSA locks (per CCA head)</legend>
      <Pick label="Section" value={sectionId} onChange={setSectionId} options={sections.options} loading={sections.isPending} />
      {sectionId && <QueryState q={q} empty={q.data?.length === 0 ? "No CCA heads for this section's grade." : undefined} />}
      <ul className="divide-y">
        {q.data?.map((h) => (
          <li key={h.id} className="flex items-center justify-between py-2 text-sm">
            <span>{h.name}{h.lock && <span className="ml-2 text-muted-foreground">since {h.lock.date} {h.lock.time}</span>}</span>
            <Switch aria-label={`${h.name} locked`} checked={!!h.lock?.is_locked} disabled={set.isPending} onCheckedChange={(c) => set.mutate({ head_id: h.id, is_locked: c })} />
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">Senior CSA locks (activity based) are not exposed here: they need a CSA type per activity.</p>
    </fieldset>
  )
}
