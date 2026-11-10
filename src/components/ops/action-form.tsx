"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useApiError } from "@/hooks/shared/use-api-error"
import { apiClient } from "@/lib/api-client"
import { buildPayload, toFormValues } from "@/lib/ops/form"
import type { ActionFormCfg } from "@/lib/ops/types"
import { qk } from "@/lib/query-keys"

import { FieldInput } from "./field-input"
import { ScopeBar, useScope } from "./scope-bar"

/** One-shot form (JSON or multipart) that POST/PUTs and toasts the result. `invalidate` refreshes a resource list. */
export function ActionForm({ cfg, invalidate }: { cfg: ActionFormCfg; invalidate?: string }) {
  const qc = useQueryClient()
  const { handle } = useApiError()
  const { scope, setPicked } = useScope(cfg.scope)
  const [values, setValues] = useState(() => toFormValues(cfg.fields))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const send = useMutation({
    mutationFn: async () => {
      const { body, errors: errs } = buildPayload(cfg.fields, values, { scope })
      if (Object.keys(errs).length) { setErrors(errs); throw new Error("validation") }
      let payload: unknown = body
      if (cfg.multipart) {
        const fd = new FormData()
        for (const f of cfg.fields) {
          const v = body[f.name]
          if (v !== undefined && v !== null && v !== "") fd.append(f.name, v instanceof Blob ? v : String(v))
        }
        payload = fd
      }
      return apiClient.request({ method: cfg.method, url: cfg.path, data: payload, headers: cfg.multipart ? { "Content-Type": undefined } : undefined })
    },
    onSuccess: () => {
      toast.success(`${cfg.title} done`)
      setErrors({})
      setValues(toFormValues(cfg.fields))
      if (invalidate) qc.invalidateQueries({ queryKey: qk("ops", invalidate) })
    },
    onError: (e) => {
      if ((e as Error).message === "validation") return
      setErrors(handle(e).fieldErrors ?? {})
    },
  })

  return (
    <form className="space-y-3 rounded-lg border p-4" noValidate onSubmit={(e) => { e.preventDefault(); send.mutate() }}>
      <h2 className="font-medium">{cfg.title}</h2>
      <ScopeBar mode={cfg.scope} scope={scope} onChange={setPicked} />
      <div className="grid gap-3 sm:grid-cols-2">
        {cfg.fields.filter((f) => !f.scoped).map((f) => (
          <FieldInput key={f.name} field={f} all={values} value={values[f.name]} error={errors[f.name]} idPrefix={cfg.key}
            onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
        ))}
      </div>
      <Button type="submit" disabled={send.isPending}>{send.isPending ? "Working..." : cfg.submit}</Button>
    </form>
  )
}
