"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DownloadButton } from "@/components/shared/download-button"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useApiError } from "@/hooks/shared/use-api-error"
import { apiClient } from "@/lib/api-client"
import { buildPayload, fillRow, toFormValues } from "@/lib/ops/form"
import type { Resource } from "@/lib/ops/types"
import { qk } from "@/lib/query-keys"
import { parseApiError } from "@/lib/shared/api-error"

import { FieldInput, RefPicker } from "./field-input"
import { ResultTable, cellText } from "./result-table"
import { ScopeBar, useScope } from "./scope-bar"

type Row = Record<string, unknown>

/** List + create/edit dialog + delete confirm + row actions, driven by a Resource config. */
export function ResourcePage({ res }: { res: Resource }) {
  const qc = useQueryClient()
  const { handle } = useApiError()
  const { scope, setPicked } = useScope(res.scope)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState<Row | "new" | null>(null)
  const [values, setValues] = useState<Row>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleting, setDeleting] = useState<Row | null>(null)
  const [acting, setActing] = useState<{ row: Row; idx: number } | null>(null)
  const idKey = res.idKey ?? "id"

  const params: Record<string, string> = { ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
  if (scope.branch_id) params.branch_id = scope.branch_id
  if (scope.academic_year_id) params.academic_year_id = scope.academic_year_id
  const needScope = (res.scopeRequired && (!scope.branch_id || (res.scope === "branch+year" && !scope.academic_year_id))) ||
    !!res.filters?.some((f) => f.required && !filters[f.name])

  const list = useQuery({
    queryKey: qk("ops", res.key, params),
    enabled: !needScope,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<Row[] | Row | null>(res.list, { params })
        return (Array.isArray(data) ? data : data ? [data] : []) as Row[]
      } catch (e) {
        if (parseApiError(e).kind === "not_found") return [] // singleton resources 404 until configured
        throw e
      }
    },
  })
  const refresh = () => qc.invalidateQueries({ queryKey: qk("ops", res.key) })

  const open = (row: Row | "new") => {
    setValues(toFormValues(res.fields, row === "new" ? undefined : row))
    setErrors({})
    setEditing(row)
  }
  const save = useMutation({
    mutationFn: async () => {
      const isNew = editing === "new"
      const { body, errors: errs } = buildPayload(res.fields, values, { editing: !isNew, scope })
      if (Object.keys(errs).length) { setErrors(errs); throw new Error("validation") }
      if (res.upsert) {
        const idField = res.fields.find((f) => f.name === idKey)
        const id = isNew ? values[idKey] : (editing as Row)[idKey]
        if (!id && idField) { setErrors({ [idKey]: `${idField.label} is required` }); throw new Error("validation") }
        return apiClient.put(fillRow(res.item!, { [idKey]: id }, idKey), body)
      }
      return isNew ? apiClient.post(res.create!, body) : apiClient.put(fillRow(res.item!, editing as Row, idKey), body)
    },
    onSuccess: () => { toast.success(`${res.noun} saved`); setEditing(null); refresh() },
    onError: (e) => {
      if ((e as Error).message === "validation") return
      const p = handle(e)
      setErrors(p.fieldErrors ?? {})
    },
  })
  const remove = useMutation({
    mutationFn: async (row: Row) => apiClient.delete(fillRow(res.item!, row, idKey)),
    onSuccess: () => { toast.success(`${res.noun} deleted`); setDeleting(null); refresh() },
    onError: (e) => { handle(e); setDeleting(null) },
  })
  const act = useMutation({
    mutationFn: async ({ row, idx }: { row: Row; idx: number }) => {
      const a = res.actions![idx]
      return apiClient.request({ method: a.method, url: fillRow(a.path, row, idKey) })
    },
    onSuccess: (_, v) => { toast.success(`${res.actions![v.idx].label} done`); setActing(null); refresh() },
    onError: (e) => { handle(e); setActing(null) },
  })

  const canEdit = !!res.item && !res.noUpdate
  const canDelete = !!res.item && !res.noDelete
  const canCreate = !!(res.create || res.upsert)
  const formFields = res.fields.filter((f) => !f.scoped && !(editing !== "new" && f.createOnly) && !(editing === "new" && f.editOnly))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{res.title}</h1>
        {canCreate && <Button onClick={() => open("new")} disabled={needScope || (!!res.scope && !scope.branch_id)}><Plus /> New {res.noun}</Button>}
      </div>
      <ScopeBar mode={res.scope} scope={scope} onChange={setPicked} />
      {res.filters && (
        <div className="flex flex-wrap items-end gap-3">
          {res.filters.map((f) => (
            <div key={f.name} className="w-56 space-y-1.5">
              <span className="text-sm font-medium">{f.label}</span>
              {f.kind === "select" ? (
                <select aria-label={f.label} className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={filters[f.name] ?? ""} onChange={(e) => setFilters((s) => ({ ...s, [f.name]: e.target.value }))}>
                  <option value="">All</option>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <RefPicker kind={f.kind} value={filters[f.name] || undefined} onChange={(v) => setFilters((s) => ({ ...s, [f.name]: v }))} />
              )}
            </div>
          ))}
        </div>
      )}
      {needScope ? (
        <p className="text-sm text-muted-foreground">Choose the filters above to load {res.title.toLowerCase()}.</p>
      ) : (
        <ResultTable
          rows={list.data}
          isLoading={list.isPending}
          error={list.isError ? parseApiError(list.error).message : undefined}
          onRetry={() => list.refetch()}
          columns={res.columns}
          empty={`No ${res.title.toLowerCase()} yet.`}
          rowActions={(row) => (
            <div className="flex justify-end gap-1">
              {res.downloads?.map((d) => (
                <DownloadButton key={d.label} size="sm" path={fillRow(d.path, row, idKey)} fallbackName={d.fallbackName}>{d.label}</DownloadButton>
              ))}
              {res.actions?.map((a, idx) =>
                !a.when || cellText(row[a.when.key]) === a.when.equals ? (
                  <Button key={a.label} size="sm" variant="outline" onClick={() => setActing({ row, idx })}>{a.label}</Button>
                ) : null
              )}
              {canEdit && <Button variant="ghost" size="icon-sm" aria-label={`Edit ${res.noun}`} onClick={() => open(row)}><Pencil /></Button>}
              {canDelete && <Button variant="ghost" size="icon-sm" aria-label={`Delete ${res.noun}`} onClick={() => setDeleting(row)}><Trash2 /></Button>}
            </div>
          )}
        />
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && !save.isPending && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing === "new" ? "New" : "Edit"} {res.noun}</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save.mutate() }} noValidate>
            {formFields.map((f) => (
              <FieldInput key={f.name} field={f} all={values} value={values[f.name]} error={errors[f.name]} idPrefix={res.key}
                onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} destructive confirmLabel="Delete" isPending={remove.isPending}
        title={`Delete ${res.noun}?`} description={`This removes the ${res.noun} permanently and is recorded in the audit log.`}
        onConfirm={() => deleting && remove.mutate(deleting)} />
      <ConfirmDialog open={!!acting} onOpenChange={(o) => !o && setActing(null)} isPending={act.isPending}
        title={acting ? res.actions![acting.idx].label : ""} description={acting ? (res.actions![acting.idx].confirm ?? `${res.actions![acting.idx].label} this ${res.noun}? This is recorded in the audit log.`) : ""}
        onConfirm={() => acting && act.mutate(acting)} />
    </div>
  )
}
