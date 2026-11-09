"use client"

import { useState } from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useAppSettings, useAppVersions, useSetAppSetting, useSetAppVersion } from "@/hooks/use-settings"

function Versions() {
  const { data, isPending, isError } = useAppVersions()
  const set = useSetAppVersion()
  const [type, setType] = useState("")
  const [version, setVersion] = useState("")
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">App versions</h2>
      {isPending ? <Skeleton className="h-16" /> : isError ? <p role="alert" className="text-sm text-destructive">Could not load versions.</p> : data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No versions recorded.</p>
      ) : (
        <ul className="divide-y rounded-lg border">{data.map((v) => <li key={v.id} className="p-3 text-sm"><b>{v.type}</b> {v.version} {v.comment && <span className="text-muted-foreground">- {v.comment}</span>}</li>)}</ul>
      )}
      <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); set.mutate({ type: type.trim(), version: version.trim() }) }}>
        <div><label htmlFor="av-type" className="text-sm font-medium">App type</label><Input id="av-type" value={type} onChange={(e) => setType(e.target.value)} placeholder="android" /></div>
        <div><label htmlFor="av-ver" className="text-sm font-medium">Version</label><Input id="av-ver" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.2.3" /></div>
        <Button type="submit" disabled={set.isPending || !type.trim() || !version.trim()}>Set version</Button>
      </form>
    </section>
  )
}

export default function AppSettingsPage() {
  const [year, setYear] = useState<string>()
  const { data, isPending, isError } = useAppSettings(year)
  const save = useSetAppSetting()
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">App settings</h1>
      <section className="space-y-3">
        <label className="text-sm font-medium">Academic year</label>
        <AcademicYearSelect value={year} onChange={setYear} />
        {year && (isPending ? <Skeleton className="h-24" /> : isError ? <p role="alert" className="text-sm text-destructive">Could not load settings.</p> : (
          <ul className="divide-y rounded-lg border">
            {data.map((s) => (
              <li key={s.name} className="flex items-center justify-between p-3">
                <span className="capitalize">{s.name}</span>
                <Switch aria-label={`${s.name} enabled`} checked={s.status} disabled={save.isPending}
                  onCheckedChange={(status) => save.mutate({ name: s.name, status, academic_year_id: year })} />
              </li>
            ))}
          </ul>
        ))}
      </section>
      <Versions />
    </div>
  )
}
