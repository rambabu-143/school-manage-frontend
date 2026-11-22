"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAdmissionRooms, useAllocateRoom, useAllocationList } from "@/hooks/use-admission-evaluation"
import { buildAllocateBody, currentRoom } from "@/lib/admission-evaluation"
import { errorMessage } from "@/lib/error-message"

import { NativeSelect } from "./native-select"
import { ConfirmDialog, QueryState, regName, roomLabel, type EvalCtx } from "./shared"

type Move = { regId: string; name: string; roomId: string; from?: string }

export function RoomsTab({ ctx }: { ctx: EvalCtx }) {
  const [gender, setGender] = React.useState("ALL")
  const [category, setCategory] = React.useState("ALL")
  const [choice, setChoice] = React.useState<Record<string, string>>({})
  const [confirm, setConfirm] = React.useState<Move | null>(null)
  const [rowErr, setRowErr] = React.useState<Record<string, string>>({})
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const rooms = useAdmissionRooms(ctx.scope, ctx.gradeId)
  const list = useAllocationList(ctx.scope, { className: ctx.className, category, gender, phase: ctx.phase })
  const allocate = useAllocateRoom()
  const phaseRooms = (rooms.data ?? []).filter((r) => r.phase === ctx.phase)
  const label = (id?: string) => (rooms.data ?? []).find((r) => r.id === id)?.room_no ?? "unknown room"

  const run = (m: Move) => {
    const body = buildAllocateBody(m.roomId, ctx.phase)
    if (!body) return
    setBusyId(m.regId)
    setRowErr((e) => ({ ...e, [m.regId]: "" }))
    allocate.mutate({ regId: m.regId, body }, {
      onSuccess: () => toast.success(`Allocated ${m.name} to ${label(m.roomId)}`),
      // 409 = room full, 404 = registration of another branch/tenant or room gone; shown on the row.
      onError: (e) => setRowErr((r) => ({ ...r, [m.regId]: errorMessage(e) })),
      onSettled: () => setBusyId(null),
    })
  }

  const request = (regId: string, name: string, from?: string) => {
    const roomId = choice[regId]
    if (!roomId) return
    const m = { regId, name, roomId, from }
    if (from && from !== roomId) setConfirm(m)
    else if (from === roomId) toast.info("Already in this room")
    else run(m)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1"><Label>Gender</Label><NativeSelect value={gender === "ALL" ? "" : gender} onChange={(v) => setGender(v || "ALL")} placeholder="All" options={[{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }]} /></div>
        <div className="space-y-1"><Label>Category</Label><NativeSelect value={category === "ALL" ? "" : category} onChange={(v) => setCategory(v || "ALL")} placeholder="All" options={["GENERAL", "SIBLING", "CHRISTIAN", "ALUMNI", "EDC", "STAFF"].map((c) => ({ value: c, label: c }))} /></div>
      </div>
      <QueryState q={list} needs="Select a branch, year, grade and phase." />
      {list.isSuccess && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead><tr className="text-left"><th className="p-2">Reg no</th><th className="p-2">Name</th><th className="p-2">Current room</th><th className="p-2">Allocate to</th></tr></thead>
            <tbody>
              {list.data.length === 0 && <tr><td className="p-2 text-muted-foreground" colSpan={4}>No accepted applicants for these filters.</td></tr>}
              {list.data.map((r) => {
                const cur = currentRoom(r, ctx.phase)
                return (
                  <tr key={r.id} className="border-t align-top">
                    <td className="p-2">{r.registration_no}</td>
                    <td className="p-2">{regName(r)}</td>
                    <td className="p-2">{cur ? label(cur) : "not allocated"}</td>
                    <td className="space-y-1 p-2">
                      <div className="flex gap-2">
                        <NativeSelect value={choice[r.id] ?? ""} onChange={(v) => setChoice((c) => ({ ...c, [r.id]: v }))} placeholder="Select room" disabled={allocate.isPending} options={phaseRooms.map((x) => ({ value: x.id, label: roomLabel(x) }))} />
                        <Button size="sm" disabled={allocate.isPending || !choice[r.id]} onClick={() => request(r.id, regName(r), cur)}>{busyId === r.id ? "Saving..." : cur ? "Move" : "Allocate"}</Button>
                      </div>
                      {rowErr[r.id] && <p role="alert" className="text-xs text-destructive">{rowErr[r.id]}</p>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Move to another room?"
        description={confirm && `${confirm.name} is in ${label(confirm.from)} for phase ${ctx.phase}. This replaces that allocation with ${label(confirm.roomId)}.`}
        confirmLabel="Move"
        onConfirm={() => { const m = confirm; setConfirm(null); if (m) run(m) }}
      />
    </div>
  )
}
