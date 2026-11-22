"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAbsentees, useAdmissionRooms, useMarkAttendance, useRoomRows } from "@/hooks/use-admission-evaluation"
import { buildAttendanceBody, currentAttendance } from "@/lib/admission-evaluation"
import { errorMessage } from "@/lib/error-message"

import { NativeSelect } from "./native-select"
import { QueryState, regName, roomLabel, type EvalCtx } from "./shared"

export function AttendanceTab({ ctx }: { ctx: EvalCtx }) {
  const [roomId, setRoomId] = React.useState("")
  const rooms = useAdmissionRooms(ctx.scope, ctx.gradeId)
  const rows = useRoomRows("mark-attendance", ctx.scope, { className: ctx.className, phase: ctx.phase, roomId })
  const absent = useAbsentees(ctx.scope, { className: ctx.className, phase: ctx.phase })
  const mark = useMarkAttendance(ctx.scope)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const set = (regId: string, attendance: "PRESENT" | "ABSENT") => {
    const body = buildAttendanceBody({ phase: ctx.phase, attendance, className: ctx.className ?? "", roomId })
    if (!body) return toast.error("Select class, phase and room first")
    setBusyId(regId)
    mark.mutate({ regId, body }, { onSuccess: () => toast.success(`Marked ${attendance.toLowerCase()}`), onError: (e) => toast.error(errorMessage(e)), onSettled: () => setBusyId(null) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1"><Label>Room</Label>
        <NativeSelect value={roomId} onChange={setRoomId} placeholder="Select room" options={(rooms.data ?? []).filter((r) => r.phase === ctx.phase).map((r) => ({ value: r.id, label: roomLabel(r) }))} />
      </div>
      <QueryState q={rows} needs="Select a class, phase and room." />
      {rows.isSuccess && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead><tr className="text-left"><th className="p-2">Reg no</th><th className="p-2">Name</th><th className="p-2">Phase {ctx.phase}</th><th className="p-2" /></tr></thead>
            <tbody>
              {rows.data.length === 0 && <tr><td className="p-2 text-muted-foreground" colSpan={4}>No applicants allocated to this room.</td></tr>}
              {rows.data.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.registration_no}</td>
                  <td className="p-2">{regName(r)}</td>
                  <td className="p-2">{currentAttendance(r, ctx.phase) ?? "not marked"}</td>
                  <td className="space-x-2 p-2">
                    <Button size="sm" variant="outline" disabled={mark.isPending} onClick={() => set(r.id, "PRESENT")}>{busyId === r.id ? "Saving..." : "Present"}</Button>
                    <Button size="sm" variant="outline" disabled={mark.isPending} onClick={() => set(r.id, "ABSENT")}>Absent</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <section className="space-y-2">
        <h3 className="text-sm font-medium">Absent in phase {ctx.phase} (whole class)</h3>
        <QueryState q={absent} needs="Select a class and phase." />
        {absent.isSuccess && (absent.data.length === 0 ? <p className="text-sm text-muted-foreground">No absentees.</p> : (
          <ul className="text-sm">{absent.data.map((r) => <li key={r.id}>{r.registration_no} {regName(r)}</li>)}</ul>
        ))}
      </section>
    </div>
  )
}
