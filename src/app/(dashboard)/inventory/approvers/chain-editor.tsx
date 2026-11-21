"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

import { UserSelect } from "@/components/user-select"
import { Button } from "@/components/ui/button"
import { useRequisitionChain, useSetRequisitionChain } from "@/hooks/use-requisition-chain"
import { validateChain } from "@/lib/approver-chain"

/** Ordered approval chain per requester; saving replaces the whole chain. */
export function ChainEditor() {
  const [requester, setRequester] = React.useState("")
  const [edited, setEdited] = React.useState<string[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const { data: chain } = useRequisitionChain(requester || undefined)
  const save = useSetRequisitionChain()
  // steps = local edits, else the saved chain
  const steps = edited ?? (chain ? [...chain].sort((a, b) => a.sort_order - b.sort_order).map((c) => c.approver_user_id) : [])
  const setSteps = (f: (p: string[]) => string[]) => setEdited(f(steps))

  function onSave() {
    const err = validateChain(requester, steps)
    setError(err)
    if (!err) save.mutate({ requesterId: requester, approvers: steps }, { onSuccess: () => setEdited(null) })
  }

  return (
    <div className="mb-6 space-y-3 rounded-lg border p-4">
      <h2 className="font-medium">Approval chain</h2>
      <p className="text-sm text-muted-foreground">Ordered approvers for one requester. Saving replaces their whole chain.</p>
      <div className="max-w-sm">
        <UserSelect value={requester || undefined} onChange={(v) => { setRequester(v); setEdited(null) }} />
      </div>
      {requester && (
        <>
          {steps.map((s, i) => (
            <div key={i} className="flex max-w-sm items-center gap-2">
              <span className="w-5 text-sm text-muted-foreground">{i + 1}</span>
              <UserSelect value={s || undefined} onChange={(v) => setSteps((p) => p.map((x, j) => (j === i ? v : x)))} />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove step" onClick={() => setSteps((p) => p.filter((_, j) => j !== i))}>
                <Trash2 />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={steps.length >= 10} onClick={() => setSteps((p) => [...p, ""])}>
              <Plus /> Add approver
            </Button>
            <Button type="button" disabled={save.isPending} onClick={onSave}>Save chain</Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      )}
    </div>
  )
}
