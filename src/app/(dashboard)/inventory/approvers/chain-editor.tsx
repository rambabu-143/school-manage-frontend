"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

import { UserSelect } from "@/components/user-select"
import { Button } from "@/components/ui/button"
import { useClearRequisitionChain, useRequisitionChain, useSetRequisitionChain, type ChainStep } from "@/hooks/use-requisition-chain"
import { validateChain } from "@/lib/approver-chain"

type Step = Pick<ChainStep, "approver_user_id" | "role_id">

/** Ordered approval chain per requester; saving replaces the whole chain. */
export function ChainEditor() {
  const [requester, setRequester] = React.useState("")
  const [edited, setEdited] = React.useState<Step[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const { data: chain } = useRequisitionChain(requester || undefined)
  const save = useSetRequisitionChain()
  const clear = useClearRequisitionChain()
  // steps = local edits, else the saved chain
  const steps = edited ?? (chain ? [...chain].sort((a, b) => a.sort_order - b.sort_order).map((c) => ({ approver_user_id: c.approver_user_id, role_id: c.role_id })) : [])
  const setSteps = (f: (p: Step[]) => Step[]) => setEdited(f(steps))

  function onSave() {
    const err = validateChain(requester, steps.map((x) => x.approver_user_id))
    setError(err)
    if (!err) save.mutate({ requesterId: requester, approvers: steps }, { onSuccess: () => setEdited(null) })
  }

  return (
    <div className="mb-6 space-y-3 rounded-lg border p-4">
      <h2 className="font-medium">Approval chain</h2>
      <p className="text-sm text-muted-foreground">Ordered approvers for one requester. Saving replaces their whole chain (existing roles are kept) and resets their pending requisitions to step 1.</p>
      <div className="max-w-sm">
        <UserSelect value={requester || undefined} onChange={(v) => { setRequester(v); setEdited(null) }} />
      </div>
      {requester && (
        <>
          {steps.map((s, i) => (
            <div key={i} className="flex max-w-sm items-center gap-2">
              <span className="w-5 text-sm text-muted-foreground">{i + 1}</span>
              <UserSelect value={s.approver_user_id || undefined} onChange={(v) => setSteps((p) => p.map((x, j) => (j === i ? { ...x, approver_user_id: v } : x)))} />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove step" onClick={() => setSteps((p) => p.filter((_, j) => j !== i))}>
                <Trash2 />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={steps.length >= 10} onClick={() => setSteps((p) => [...p, { approver_user_id: "", role_id: null }])}>
              <Plus /> Add approver
            </Button>
            <Button type="button" disabled={save.isPending} onClick={onSave}>Save chain</Button>
            <Button type="button" variant="outline" disabled={clear.isPending || !chain?.length}
              onClick={() => { if (window.confirm("Clear this requester's whole approval chain?")) clear.mutate(requester, { onSuccess: () => setEdited(null) }) }}>
              Clear chain
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      )}
    </div>
  )
}
