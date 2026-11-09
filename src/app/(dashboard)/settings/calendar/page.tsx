"use client"

import { useState } from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { BranchSelect } from "@/components/branch-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useCalendarSettings, useCreateCalendarSetting, useDeleteCalendarSetting } from "@/hooks/use-settings"

export default function CalendarSettingsPage() {
  const [branch, setBranch] = useState<string>()
  const [year, setYear] = useState<string>()
  const [mod, setMod] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const { data, isPending, isError, refetch } = useCalendarSettings(branch, year)
  const create = useCreateCalendarSetting()
  const del = useDeleteCalendarSetting()
  const ready = branch && year && mod.trim() && start && end && start <= end
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Calendar settings</h1>
      <div className="grid gap-2 sm:grid-cols-2">
        <BranchSelect value={branch} onChange={setBranch} />
        <AcademicYearSelect value={year} onChange={setYear} />
      </div>
      {!branch || !year ? <p className="text-sm text-muted-foreground">Pick a branch and academic year.</p> : isPending ? <Skeleton className="h-24" /> : isError ? (
        <p role="alert" className="text-sm text-destructive">Could not load. <Button variant="link" onClick={() => refetch()}>Retry</Button></p>
      ) : data.length === 0 ? <p className="text-sm text-muted-foreground">No calendar settings for this selection.</p> : (
        <ul className="divide-y rounded-lg border">
          {data.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 p-3 text-sm">
              <span><b>{s.module}</b> {s.start_date} to {s.end_date}{s.is_open_till_today ? " (open till today)" : ""}</span>
              <Button size="sm" variant="outline" disabled={del.isPending} aria-label={`Delete ${s.module} setting`} onClick={() => del.mutate(s.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      )}
      <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (branch && year) create.mutate({ branch_id: branch, academic_year_id: year, module: mod.trim(), start_date: start, end_date: end, is_open_till_today: false }) }}>
        <div><label htmlFor="cs-mod" className="text-sm font-medium">Module</label><Input id="cs-mod" value={mod} onChange={(e) => setMod(e.target.value)} /></div>
        <div><label htmlFor="cs-s" className="text-sm font-medium">Start</label><Input id="cs-s" type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
        <div><label htmlFor="cs-e" className="text-sm font-medium">End</label><Input id="cs-e" type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
        <Button type="submit" disabled={!ready || create.isPending}>Add</Button>
      </form>
    </div>
  )
}
