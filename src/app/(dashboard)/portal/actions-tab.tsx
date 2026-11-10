"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { errorMessage } from "@/lib/error-message"
import { qk } from "@/lib/query-keys"
import { api } from "@/lib/typed-api"

export function TransportRenewalTab({ studentId }: { studentId: string }) {
  const [year, setYear] = useState<string>()
  const [type, setType] = useState("")
  const qc = useQueryClient()
  const status = useQuery({
    queryKey: qk("transport-renewal", studentId, year),
    queryFn: () => api("get", "/transport-renewal-forms/student/{student_id}", { path: { student_id: studentId }, query: { academic_year_id: year! } }),
    enabled: !!year,
  })
  const submit = useMutation({
    mutationFn: () => api("post", "/transport-renewal-forms", { body: { student_id: studentId, academic_year_id: year!, transport_type: type.trim(), platform: "browser" } }),
    onSuccess: () => { toast.success("Renewal form submitted"); qc.invalidateQueries({ queryKey: qk("transport-renewal") }) },
    onError: (e) => toast.error(errorMessage(e)),
  })
  return (
    <div className="max-w-md space-y-3">
      <AcademicYearSelect value={year} onChange={setYear} />
      {!year ? <p className="text-sm text-muted-foreground">Pick an academic year.</p> : status.isPending ? <Skeleton className="h-12" /> : status.isError ? (
        <p role="alert" className="text-sm text-destructive">{errorMessage(status.error)}</p>
      ) : status.data.filled ? (
        <p className="text-sm">Renewal already submitted: {status.data.form?.transport_type}.</p>
      ) : (
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); submit.mutate() }}>
          <label htmlFor="tr-type" className="text-sm font-medium">Transport type</label>
          <Input id="tr-type" value={type} onChange={(e) => setType(e.target.value)} />
          <Button type="submit" disabled={submit.isPending || !type.trim()}>Submit renewal</Button>
        </form>
      )}
    </div>
  )
}

export function ConsentTab({ studentId }: { studentId: string }) {
  const qc = useQueryClient()
  const set = useMutation({
    mutationFn: (consent: boolean) => api("put", "/students/{student_id}/social-media-consent", { path: { student_id: studentId }, body: { consent } }),
    onSuccess: () => { toast.success("Consent saved"); qc.invalidateQueries({ queryKey: qk("portal") }) },
    onError: (e) => toast.error(errorMessage(e)),
  })
  return (
    <div className="space-y-2">
      <p className="text-sm">Allow the school to feature this child on its social media.</p>
      <div className="flex gap-2">
        <Button disabled={set.isPending} onClick={() => set.mutate(true)}>I consent</Button>
        <Button variant="outline" disabled={set.isPending} onClick={() => set.mutate(false)}>I do not consent</Button>
      </div>
    </div>
  )
}

export function BirthdayWishesTab() {
  const q = useQuery({ queryKey: qk("birthday-wishes"), queryFn: () => api("get", "/birthday-wishes", { query: { limit: 20 } }) })
  if (q.isPending) return <Skeleton className="h-16" />
  if (q.isError) return <p role="alert" className="text-sm text-destructive">{errorMessage(q.error)}</p>
  if (!q.data.length) return <p className="text-sm text-muted-foreground">No birthday wishes configured.</p>
  return <ul className="divide-y rounded-lg border">{q.data.map((w) => <li key={w.id} className="p-3 text-sm"><b>{w.type}</b> {w.text}</li>)}</ul>
}
