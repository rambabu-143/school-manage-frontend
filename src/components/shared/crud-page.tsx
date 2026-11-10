"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, type FieldValues, type Path, type Resolver } from "react-hook-form"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { ZodType } from "zod"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ServerDataTable } from "@/components/shared/server-data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useApiError } from "@/hooks/shared/use-api-error"
import { useListParams } from "@/hooks/shared/use-url-params"
import { useSession } from "@/hooks/use-session"
import { apiClient } from "@/lib/api-client"
import { parseApiError } from "@/lib/shared/api-error"
import { toApiParams } from "@/lib/shared/url-params"
import type { Role } from "@/types/auth"

export interface CrudField<T> {
  name: Path<T>
  label: string
  type?: "text" | "number" | "textarea" | "date" | "switch" | "select"
  /** For type "select". */
  options?: { value: string; label: string }[]
}

export interface CrudConfig<TRow extends { id: string }, TForm extends FieldValues> {
  /** Singular noun for toasts/dialogs, e.g. "grade". */
  noun: string
  title: string
  queryKey: string
  /** Collection path; item path is `${path}/${id}`. */
  path: string
  columns: ColumnDef<TRow, unknown>[]
  schema: ZodType<TForm>
  fields: CrudField<TForm>[]
  defaults: TForm
  /** Human label of a row, used in the delete confirm ("Delete grade 'X'?"). */
  rowLabel: (row: TRow) => string
  /** Row -> form values when editing. Defaults to the row itself. */
  toForm?: (row: TRow) => TForm
  /** Roles allowed per action; omit = everyone. UI hint only - the backend enforces. */
  roles?: { create?: Role[]; update?: Role[]; delete?: Role[] }
  sortable?: string[]
  /** Fixed query params added to the list call (e.g. required filters). */
  query?: Record<string, unknown>
}

type Rows<T> = T[] | { items: T[]; total: number }

/** Standard admin page: list + create/edit dialog + delete confirm. Mutations are not optimistic; they toast and refetch. */
export function CrudPage<TRow extends { id: string }, TForm extends FieldValues>({ cfg }: { cfg: CrudConfig<TRow, TForm> }) {
  const qc = useQueryClient()
  const { data: user } = useSession()
  const { handle } = useApiError()
  const lp = useListParams(undefined, cfg.sortable)
  const [editing, setEditing] = useState<TRow | "new" | null>(null)
  const [deleting, setDeleting] = useState<TRow | null>(null)
  const allowed = (a: "create" | "update" | "delete") => !cfg.roles?.[a] || (!!user && cfg.roles[a]!.includes(user.role))

  const list = useQuery({
    queryKey: [cfg.queryKey, lp, cfg.query],
    queryFn: async () => (await apiClient.get<Rows<TRow>>(cfg.path, { params: { ...toApiParams(lp), ...cfg.query } })).data,
    placeholderData: keepPreviousData,
  })
  const rows = Array.isArray(list.data) ? list.data : list.data?.items
  const total = Array.isArray(list.data) ? undefined : list.data?.total

  const form = useForm<TForm>({ resolver: zodResolver(cfg.schema as never) as Resolver<TForm>, defaultValues: cfg.defaults as never })
  const open = (row: TRow | "new") => {
    form.reset(row === "new" ? cfg.defaults : (cfg.toForm?.(row) ?? (row as unknown as TForm)))
    setEditing(row)
  }

  const save = useMutation({
    mutationFn: async (values: TForm) =>
      editing === "new" ? apiClient.post(cfg.path, values) : apiClient.put(`${cfg.path}/${(editing as TRow).id}`, values),
    onSuccess: () => {
      toast.success(`${cfg.noun} ${editing === "new" ? "created" : "updated"}`)
      setEditing(null)
      qc.invalidateQueries({ queryKey: [cfg.queryKey] })
    },
    onError: (e) => handle(e, form.setError),
  })
  const remove = useMutation({
    mutationFn: async (row: TRow) => apiClient.delete(`${cfg.path}/${row.id}`),
    onSuccess: () => {
      toast.success(`${cfg.noun} deleted`)
      setDeleting(null)
      qc.invalidateQueries({ queryKey: [cfg.queryKey] })
    },
    onError: (e) => { handle(e); setDeleting(null) },
  })

  const columns: ColumnDef<TRow, unknown>[] = [
    ...cfg.columns,
    ...(allowed("update") || allowed("delete")
      ? [{
          id: "actions",
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <div className="flex justify-end gap-1">
              {allowed("update") && <Button variant="ghost" size="icon-sm" aria-label={`Edit ${cfg.rowLabel(row.original)}`} onClick={() => open(row.original)}><Pencil /></Button>}
              {allowed("delete") && <Button variant="ghost" size="icon-sm" aria-label={`Delete ${cfg.rowLabel(row.original)}`} onClick={() => setDeleting(row.original)}><Trash2 /></Button>}
            </div>
          ),
        } as ColumnDef<TRow, unknown>]
      : []),
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{cfg.title}</h1>
        {allowed("create") && <Button onClick={() => open("new")}><Plus /> New {cfg.noun}</Button>}
      </div>

      <ServerDataTable
        columns={columns}
        rows={rows}
        total={total}
        isLoading={list.isPending}
        error={list.isError ? parseApiError(list.error).message : null}
        onRetry={() => list.refetch()}
        sortable={cfg.sortable}
        emptyMessage={`No ${cfg.noun}s yet.`}
      />

      <Dialog open={editing !== null} onOpenChange={(o) => !o && !save.isPending && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing === "new" ? `New ${cfg.noun}` : `Edit ${cfg.noun}`}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
              {cfg.fields.map((f) => (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{f.label}</FormLabel>
                      <FormControl>
                        {f.type === "textarea" ? <Textarea {...field} value={field.value ?? ""} />
                          : f.type === "select" ? (
                            <select {...field} value={field.value ?? ""} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                              <option value="">Select...</option>
                              {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          )
                          : f.type === "switch" ? <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                          : f.type === "number" ? <Input type="number" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                          : <Input type={f.type === "date" ? "date" : "text"} {...field} value={field.value ?? ""} />}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              {form.formState.errors.root?.server?.message && (
                <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.server.message}</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" disabled={save.isPending} onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${cfg.noun}?`}
        description={deleting ? `This permanently deletes ${cfg.noun} "${cfg.rowLabel(deleting)}". This action is recorded in the audit log and cannot be undone.` : ""}
        confirmLabel="Delete"
        destructive
        isPending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </div>
  )
}
