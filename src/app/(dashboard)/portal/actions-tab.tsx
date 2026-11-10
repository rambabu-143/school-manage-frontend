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
