"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "./native-select"
import { useAdmissionRooms, useAdmissionSubjects, useRoomRows, useSaveMarks } from "@/hooks/use-admission-evaluation"
import { buildMarksPayload, decideSave, entryFor, failedDrafts } from "@/lib/admission-evaluation"
import { errorMessage } from "@/lib/error-message"

import { ConfirmDialog, QueryState, regName, roomLabel, type EvalCtx } from "./shared"

export function MarksTab({ ctx }: { ctx: EvalCtx }) {
  const [reappear, setReappear] = React.useState(false)
  const [roomId, setRoomId] = React.useState("")
  const [subjectId, setSubjectId] = React.useState("")
  const [drafts, setDrafts] = React.useState<Record<string, string>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [pending, setPending] = React.useState<ReturnType<typeof buildMarksPayload> | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)
  const [note, setNote] = React.useState<string | null>(null)

  const rooms = useAdmissionRooms(ctx.scope, ctx.gradeId)
  const subjects = useAdmissionSubjects(ctx.scope, ctx.gradeId)
  const subject = subjects.data?.find((s) => s.id === subjectId)
  const rows = useRoomRows(reappear ? "reappear-marks-entry" : "marks-entry", ctx.scope, { className: ctx.className, phase: ctx.phase, roomId, subjectId })
  const save = useSaveMarks(reappear)
  const list = rows.data ?? []

  // Drafts belong to one room/subject/mode; drop them whenever the sheet changes.
  const reset = (fn: () => void) => { fn(); setDrafts({}); setErrors({}); setNote(null) }

  const build = (data: typeof list) => buildMarksPayload({ rows: data, drafts, subjectId, maxMarks: subject?.max_marks ?? 0, reappear, phase: ctx.phase })

  const review = () => {
    if (!subject) return
    const built = build(list)
    setErrors(built.errors)
    if (Object.keys(built.errors).length) return toast.error("Fix the highlighted marks before saving")
    if (!built.payload.length) return toast.info("No changed marks to save")
    setPending(built)
  }

  const submit = async () => {
    if (!pending) return
    const shown = pending
    setPending(null)
    setRefreshing(true)
    // The backend replaces marks_details wholesale with no version check, so merge against the
    // latest server copy, not the sheet loaded earlier (another teacher may have saved a subject since).
    let r
    try { r = await rows.refetch() } finally { setRefreshing(false) }
    if (r.isError || !r.data) return toast.error("Could not reload marks; nothing was saved")
    const built = build(r.data)
    setErrors(built.errors)
    if (Object.keys(built.errors).length) return toast.error("Fix the highlighted marks before saving")
    if (decideSave(r, shown.payload, built.payload) === "reconfirm") {
      setNote("The sheet changed on the server since you reviewed it. Check the new summary and confirm again.")
      return setPending(built.payload.length ? built : null)
    }
    const sent = built.payload.length
    const sentIds = built.payload.map((p) => p.id)
    save.mutate(built.payload, {
      onSuccess: async (res) => {
        if (res.updated >= sent) { setDrafts({}); setNote(null); return toast.success(`Saved marks for ${res.updated} applicants`) }
        // The backend skips rows it rejects and only reports a count: keep those drafts, flagged.
        const again = await rows.refetch()
        if (again.isError || !again.data) {
          setNote(`Only ${res.updated} of ${sent} rows were saved. Could not reload; reload and check before saving again.`)
          return
        }
        const failed = failedDrafts({ rows: again.data, drafts, sentIds, subjectId, reappear })
        setDrafts(failed.drafts)
        setErrors(failed.errors)
        setNote(`Only ${res.updated} of ${sent} rows were saved. The unsaved rows are highlighted.`)
      },
      onError: (e) => toast.error(errorMessage(e)),
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1"><Label>Room</Label>
          <NativeSelect value={roomId} onChange={(v) => reset(() => setRoomId(v))} placeholder="Select room" options={(rooms.data ?? []).filter((r) => r.phase === ctx.phase).map((r) => ({ value: r.id, label: roomLabel(r) }))} />
        </div>
        <div className="space-y-1"><Label>Subject</Label>
          <NativeSelect value={subjectId} onChange={(v) => reset(() => setSubjectId(v))} placeholder="Select subject" options={(subjects.data ?? []).map((s) => ({ value: s.id, label: `${s.name} (max ${s.max_marks})` }))} />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" checked={reappear} onChange={(e) => reset(() => setReappear(e.target.checked))} /> Reappear sheet
        </label>
      </div>
      <QueryState q={rows} needs="Select a class, phase, room and subject." />
      {note && <p role="alert" className="text-sm text-destructive">{note}</p>}
      {rows.isSuccess && (list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No present applicants for this room, phase and subject. Mark attendance first.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead><tr className="text-left"><th className="p-2">Reg no</th><th className="p-2">Name</th><th className="p-2">Saved</th><th className="p-2">Marks{subject ? ` (0 to ${subject.max_marks})` : ""}</th></tr></thead>
              <tbody>
                {list.map((r) => {
                  const saved = entryFor(reappear ? r.reappear_marks_details : r.marks_details, subjectId)
                  return (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">{r.registration_no}</td>
                      <td className="p-2">{regName(r)}</td>
                      <td className="p-2">{saved ? String(saved.marks) : "-"}</td>
                      <td className="p-2">
                        <Input inputMode="decimal" className="w-28" aria-label={`Marks for ${regName(r)}`} aria-invalid={!!errors[r.id]} disabled={save.isPending || refreshing}
                          value={drafts[r.id] ?? ""} onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))} />
                        {errors[r.id] && <p role="alert" className="text-xs text-destructive">{errors[r.id]}</p>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Button onClick={review} disabled={save.isPending || refreshing || !subject}>{save.isPending || refreshing ? "Saving..." : "Review and save"}</Button>
        </>
      ))}
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title="Save marks?"
        description={pending && `${pending.payload.length} applicant(s) will be updated for ${subject?.name}${pending.overwrites ? `, ${pending.overwrites} of them replace marks already saved` : ""}. Saves are not retried automatically.`}
        confirmLabel="Save marks"
        onConfirm={submit}
      />
    </div>
  )
}
