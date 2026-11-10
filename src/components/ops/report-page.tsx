"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from "@/lib/api-client"
import { buildPayload, reportRows, toFormValues } from "@/lib/ops/form"
import type { Report } from "@/lib/ops/types"
import { qk } from "@/lib/query-keys"
import { parseApiError } from "@/lib/shared/api-error"

import { FieldInput } from "./field-input"
import { ResultTable } from "./result-table"
import { ScopeBar, useScope } from "./scope-bar"

function ReportView({ rep }: { rep: Report }) {
  const { scope, setPicked } = useScope(rep.scope)
  const [values, setValues] = useState(() => toFormValues(rep.fields))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null)

  const run = useQuery({
    queryKey: qk("ops", "report", rep.key, submitted),
    enabled: submitted !== null,
    queryFn: async () => {
      const rest = { ...submitted }
      const url = rep.path.replace(/\{(\w+)\}/g, (_, k: string) => {
        const v = encodeURIComponent(String(rest[k]))
        delete rest[k]
        return v
      })
      const { data } = rep.method === "get"
        ? await apiClient.get(url, { params: rest })
        : await apiClient.post(url, rest)
      return reportRows(data, rep.flatten)
    },
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const { body, errors: errs } = buildPayload(rep.fields, values, { scope })
    setErrors(errs)
    if (Object.keys(errs).length === 0) setSubmitted(body)
  }

  return (
    <div className="space-y-4">
      <ScopeBar mode={rep.scope} scope={scope} onChange={setPicked} />
      <form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rep.fields.filter((f) => !f.scoped).map((f) => (
          <FieldInput key={f.name} field={f} all={values} value={values[f.name]} error={errors[f.name]} idPrefix={rep.key}
            onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
        ))}
        <div className="flex items-end"><Button type="submit" disabled={run.isFetching}>{run.isFetching ? "Loading..." : "Run"}</Button></div>
      </form>
      {submitted && (
        <ResultTable rows={run.data} isLoading={run.isPending} error={run.isError ? parseApiError(run.error).message : undefined} onRetry={() => run.refetch()} />
      )}
    </div>
  )
}

export function ReportPage({ title, reports }: { title: string; reports: Report[] }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      {reports.length === 1 ? <ReportView rep={reports[0]} /> : (
        <Tabs defaultValue={reports[0].key}>
          <TabsList>{reports.map((r) => <TabsTrigger key={r.key} value={r.key}>{r.title}</TabsTrigger>)}</TabsList>
          {reports.map((r) => <TabsContent key={r.key} value={r.key} className="pt-4"><ReportView rep={r} /></TabsContent>)}
        </Tabs>
      )}
    </div>
  )
}
