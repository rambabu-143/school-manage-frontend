"use client"

import { useState } from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { BranchSelect } from "@/components/branch-select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useArSettings, useCreateArSetting, useDeleteArSetting, useToggleArLive } from "@/hooks/use-settings"

export default function ArSettingsPage() {
  const [branch, setBranch] = useState<string>()
  const [year, setYear] = useState<string>()
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [standards, setStandards] = useState("")
  const { data, isPending, isError, refetch } = useArSettings(branch, year)
  const [deleting, setDeleting] = useState<{ id: string; label: string } | null>(null)
  const create = useCreateArSetting()
  const toggle = useToggleArLive()
  const del = useDeleteArSetting()
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">AR settings</h1>
      <div className="grid gap-2 sm:grid-cols-2">
        <BranchSelect value={branch} onChange={setBranch} />
        <AcademicYearSelect value={year} onChange={setYear} />
      </div>
      {!branch || !year ? <p className="text-sm text-muted-foreground">Pick a branch and academic year.</p> : isPending ? <Skeleton className="h-24" /> : isError ? (
        <p role="alert" className="text-sm text-destructive">Could not load. <Button variant="link" onClick={() => refetch()}>Retry</Button></p>
      ) : data.length === 0 ? <p className="text-sm text-muted-foreground">No AR settings for this selection.</p> : (
        <ul className="divide-y rounded-lg border">
          {data.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 p-3 text-sm">
              <span>{s.start_date} {s.start_time} {s.standards.length ? `(${s.standards.join(", ")})` : ""}</span>
              <span className="flex items-center gap-2">
                <Switch aria-label={`AR live ${s.start_date} ${s.start_time}`} checked={s.is_ar_live} disabled={toggle.isPending} onCheckedChange={(live) => toggle.mutate({ id: s.id, live })} />
                <Button size="sm" variant="outline" disabled={del.isPending} aria-label={`Delete AR setting ${s.start_date} ${s.start_time}`} onClick={() => setDeleting({ id: s.id, label: `${s.start_date} ${s.start_time}` })}>Delete</Button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => {
        e.preventDefault()
        if (branch && year) create.mutate({ branch_id: branch, academic_year_id: year, start_date: date, start_time: time, is_ar_live: false, standards: standards.split(",").map((x) => x.trim()).filter(Boolean) })
      }}>
        <div><label htmlFor="ar-d" className="text-sm font-medium">Start date</label><Input id="ar-d" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label htmlFor="ar-t" className="text-sm font-medium">Start time</label><Input id="ar-t" type="time" step={1} value={time} onChange={(e) => setTime(e.target.value.length === 5 ? `${e.target.value}:00` : e.target.value)} /></div>
        <div><label htmlFor="ar-s" className="text-sm font-medium">Standards (comma separated)</label><Input id="ar-s" value={standards} onChange={(e) => setStandards(e.target.value)} /></div>
        <Button type="submit" disabled={!branch || !year || !date || !time || create.isPending}>Add</Button>
      </form>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete AR setting?"
        description={deleting ? `This permanently deletes the AR setting starting ${deleting.label}. This action is recorded in the audit log and cannot be undone.` : ""}
        confirmLabel="Delete"
        destructive
        isPending={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </div>
  )
}
