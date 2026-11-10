"use client"

import { useState } from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
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
  const [confirm, setConfirm] = useState(false)
  // OpenAPI only bounds length (1-50); require a dotted numeric version like 1.2.3
  const validVersion = /^\d+(\.\d+){1,3}$/.test(version.trim()) && version.trim().length <= 50
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">App versions</h2>
      {isPending ? <Skeleton className="h-16" /> : isError ? <p role="alert" className="text-sm text-destructive">Could not load versions.</p> : data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No versions recorded.</p>
      ) : (
        <ul className="divide-y rounded-lg border">{data.map((v) => <li key={v.id} className="p-3 text-sm"><b>{v.type}</b> {v.version} {v.comment && <span className="text-muted-foreground">- {v.comment}</span>}</li>)}</ul>
      )}
      <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (validVersion) setConfirm(true) }}>
        <div><label htmlFor="av-type" className="text-sm font-medium">App type</label><Input id="av-type" maxLength={50} value={type} onChange={(e) => setType(e.target.value)} placeholder="android" /></div>
        <div><label htmlFor="av-ver" className="text-sm font-medium">Version</label><Input id="av-ver" maxLength={50} value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.2.3" aria-invalid={!!version.trim() && !validVersion} />{!!version.trim() && !validVersion && <p role="alert" className="text-xs text-destructive">Use a dotted number, e.g. 1.2.3</p>}</div>
        <Button type="submit" disabled={set.isPending || !type.trim() || !validVersion}>Set version</Button>
        <ConfirmDialog
          open={confirm}
          onOpenChange={setConfirm}
          title="Set app version?"
          description={`The ${type.trim()} app version will be set to ${version.trim()}. Clients may be prompted to update. This is recorded in the audit log.`}
          confirmLabel="Set version"
          isPending={set.isPending}
          onConfirm={() => set.mutate({ type: type.trim(), version: version.trim() }, { onSettled: () => setConfirm(false) })}
        />
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
        <label htmlFor="app-year" className="text-sm font-medium">Academic year</label>
        <AcademicYearSelect id="app-year" value={year} onChange={setYear} />
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
