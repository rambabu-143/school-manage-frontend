"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { FieldInput } from "@/components/ops/field-input"
import { ResultTable } from "@/components/ops/result-table"
import { ScopeBar, useScope } from "@/components/ops/scope-bar"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useSession } from "@/hooks/use-session"
import { apiClient } from "@/lib/api-client"
import { ADMISSION_OPS, buildAdmRequest, buildSendPayload, type AdmGroup, type AdmOp } from "@/lib/admission"
import { toFormValues, reportRows } from "@/lib/ops/form"
import { qk } from "@/lib/query-keys"
import { parseApiError } from "@/lib/shared/api-error"

type Row = Record<string, unknown>
const RECON_COLS = [{ key: "registration_no", label: "Registration" }, { key: "name", label: "Name" }, { key: "txn_id", label: "Txn id" }, { key: "total_amount", label: "Amount" }, { key: "txn_status", label: "Txn status" }, { key: "status", label: "Match" }]

/** Runs one admission operation picked from a group (reads show a table, writes confirm first). */
export function AdmOpsPanel({ group }: { group: AdmGroup }) {
  const qc = useQueryClient()
  const { data: user } = useSession()
  const ops = ADMISSION_OPS.filter((o) => o.group === group && (!o.roles || (!!user && o.roles.includes(user.role))))
  const [key, setKey] = React.useState(ops[0]?.key)
  const op = ops.find((o) => o.key === key) ?? ops[0]
  const { scope, setPicked } = useScope("branch+year")
  const [values, setValues] = React.useState<Row>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [asking, setAsking] = React.useState<AdmOp | null>(null)

  const run = useMutation({
    mutationFn: async (o: AdmOp) => {
      const built = buildAdmRequest(o, values, scope)
      if (built.errors) { setErrors(built.errors); throw new Error("validation") }
      let data = built.req.data
      if (o.multipart) {
        const fd = new FormData()
        fd.append("file", values.file as Blob)
        data = fd
      }
      const res = await apiClient.request({ ...built.req, data, headers: o.multipart ? { "Content-Type": undefined } : undefined })
      return res.data as unknown
    },
    onSuccess: (_d, o) => {
      setErrors({})
      setAsking(null)
      if (o.confirm) {
        toast.success(`${o.title} done`)
        qc.invalidateQueries({ queryKey: qk(o.domain) })
      }
    },
    onError: (e) => {
      setAsking(null)
      if ((e as Error).message !== "validation") toast.error(parseApiError(e).message)
    },
  })

  if (!op) return null
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const built = buildAdmRequest(op, values, scope)
    setErrors(built.errors ?? {})
    if (built.errors) return
    if (op.confirm) setAsking(op)
    else run.mutate(op)
  }
  const data = run.data
  const rows = Array.isArray(data) ? reportRows(data) : null
  const showOp = run.variables?.key === op.key

  return (
    <div className="space-y-4">
      <ScopeBar mode="branch+year" scope={scope} onChange={setPicked} />
      <div className="max-w-sm space-y-1.5">
        <span className="text-sm font-medium">Operation</span>
        <Select value={op.key} onValueChange={(v) => { setKey(v); setValues({}); setErrors({}); run.reset() }}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{ops.map((o) => <SelectItem key={o.key} value={o.key}>{o.title}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {op.fields.map((f) => (
          <FieldInput key={`${op.key}-${f.name}`} field={f} all={values} value={values[f.name] ?? toFormValues([f])[f.name]} error={errors[f.name]} idPrefix={op.key}
            onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
        ))}
        <div className="flex items-end">
          <Button type="submit" disabled={run.isPending}>{run.isPending ? "Working..." : op.confirm ? op.title : "Run"}</Button>
        </div>
      </form>
      {(errors.branch_id || errors.academic_year_id) && <p role="alert" className="text-sm text-destructive">{errors.branch_id ?? errors.academic_year_id}</p>}
      {showOp && run.isError && (run.error as Error).message !== "validation" && (
        <p role="alert" className="text-sm text-destructive">{parseApiError(run.error).message}</p>
      )}
      {showOp && run.isSuccess && rows && !op.multipart && (!op.confirm || op.method === "get") && <ResultTable rows={rows} />}
      {showOp && run.isSuccess && rows && op.multipart && (
        <ResultTable rows={rows} columns={RECON_COLS} empty="Nothing was reconciled from this file."
          rowActions={(r) => {
            const ok = r.status === "Matched"
            return <span className={ok ? "rounded bg-green-100 px-2 py-0.5 text-xs text-green-800" : "rounded bg-red-100 px-2 py-0.5 text-xs text-red-800"}>{String(r.status ?? "")}{r.insert_button ? " (needs insert)" : ""}</span>
          }} />
      )}
      {showOp && run.isSuccess && data !== null && data !== undefined && !rows && typeof data === "object" && (
        <pre className="max-h-96 overflow-auto rounded-lg border p-3 text-xs">{JSON.stringify(data, null, 2)}</pre>
      )}
      {showOp && run.isSuccess && op.key === "rep-sms-email" && rows && <SendMessage rows={rows} scope={scope} />}
      <ConfirmDialog
        open={!!asking} onOpenChange={(o) => !o && setAsking(null)} title={op.title} description={op.confirm ?? ""}
        destructive={op.method === "delete"} confirmLabel={op.title} isPending={run.isPending} onConfirm={() => asking && run.mutate(asking)}
      />
    </div>
  )
}

/** SMS / email to every recipient returned by the "Message recipients" report. */
function SendMessage({ rows, scope }: { rows: Row[]; scope: { branch_id?: string; academic_year_id?: string } }) {
  const qc = useQueryClient()
  const [kind, setKind] = React.useState<"SMS" | "Email">("SMS")
  const [text, setText] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [asking, setAsking] = React.useState(false)
  const [error, setError] = React.useState<string>()
  const send = useMutation({
    mutationFn: async () => {
      const built = buildSendPayload(kind, text, subject, rows)
      if (!built.body) throw new Error(built.error)
      return (await apiClient.post("/admission/report/send-sms-email", built.body, { params: scope })).data as { sent?: number }
    },
    onSuccess: (d) => { toast.success(`Sent to ${d.sent ?? rows.length} recipient(s)`); setAsking(false); setText(""); qc.invalidateQueries({ queryKey: qk("admission-reports") }) },
    onError: (e) => { setAsking(false); setError(parseApiError(e).message) },
  })
  if (!rows.length) return null
  return (
    <form className="space-y-3 rounded-lg border p-4" onSubmit={(e) => { e.preventDefault(); setError(undefined); if (text.trim()) setAsking(true); else setError("Message is required") }}>
      <h2 className="font-medium">Message these {rows.length} recipient(s)</h2>
      <Select value={kind} onValueChange={(v) => setKind(v as "SMS" | "Email")}>
        <SelectTrigger className="w-40" aria-label="Channel"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="SMS">SMS</SelectItem><SelectItem value="Email">Email</SelectItem></SelectContent>
      </Select>
      {kind === "Email" && <Input aria-label="Subject" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />}
      <Textarea aria-label="Message" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={send.isPending}>{send.isPending ? "Sending..." : "Send"}</Button>
      <ConfirmDialog open={asking} onOpenChange={setAsking} title={`Send ${kind}`} description={`Send this ${kind} to ${rows.length} registrant(s) now? This cannot be undone.`}
        confirmLabel="Send" isPending={send.isPending} onConfirm={() => send.mutate()} />
    </form>
  )
}
