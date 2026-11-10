"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { DownloadButton } from "@/components/shared/download-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import { parseApiError } from "@/lib/shared/api-error"

import { Pick, useSectionOptions } from "./pickers"

const YEAR_RE = /^\d{4}-\d{2,4}$/

export function DownloadsTab() {
  const sections = useSectionOptions()
  const [adm, setAdm] = useState("")
  const [year, setYear] = useState("")
  const [wing, setWing] = useState("junior")
  const [sectionId, setSectionId] = useState("")
  const [qrOn, setQrOn] = useState(false)
  const body = { admission_number: adm.trim(), year_session: year.trim() }
  const valid = adm.trim().length > 0 && YEAR_RE.test(year.trim())

  const qr = useQuery({
    queryKey: qk("exam-records", "qr", wing, sectionId),
    enabled: qrOn && !!sectionId,
    retry: false,
    queryFn: async () => (await apiClient.get<{ year_session: string; data: Record<string, unknown>[] }>(`/exam/report-${wing}/generate-qr/${sectionId}`)).data,
  })

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Files are served from the school&apos;s file store. If storage is not configured the server answers 503 and a message is shown; a missing file shows as not found.
      </p>
      <fieldset className="space-y-3 rounded-md border p-4">
        <legend className="px-1 text-sm font-medium">Student assessment record / PPR (PDF)</legend>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1"><Label htmlFor="dl-adm">Admission number</Label><Input id="dl-adm" value={adm} onChange={(e) => setAdm(e.target.value)} /></div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="dl-year">Year session</Label>
            <Input id="dl-year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025-26" aria-invalid={!!year && !YEAR_RE.test(year.trim())} />
          </div>
          <DownloadButton disabled={!valid} path={`/exam/report-${wing}/download-ar`} body={body} fallbackName="assessment-record.pdf" open>AR ({wing})</DownloadButton>
          <DownloadButton disabled={!valid} path="/academics/cr-remark/download-ppr" body={body} fallbackName="ppr.pdf" open>PPR</DownloadButton>
        </div>
        <div className="flex gap-3 text-sm" role="radiogroup" aria-label="Wing">
          {["junior", "senior"].map((w) => (
            <label key={w} className="flex items-center gap-1"><input type="radio" name="wing" checked={wing === w} onChange={() => { setWing(w); setQrOn(false) }} />{w}</label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-md border p-4">
        <legend className="px-1 text-sm font-medium">Section QR data and stream proforma</legend>
        <div className="flex flex-wrap items-end gap-3">
          <Pick label="Section" value={sectionId} onChange={(v) => { setSectionId(v); setQrOn(false) }} options={sections.options} loading={sections.isPending} />
          <Button variant="outline" disabled={!sectionId || qr.isFetching} onClick={() => (qrOn ? qr.refetch() : setQrOn(true))}>Generate QR data ({wing})</Button>
          <DownloadButton disabled={!sectionId} path={`/stream-selections/section/${sectionId}/proforma`} fallbackName="stream-proforma.pdf" open>Stream proforma</DownloadButton>
        </div>
        {qr.isFetching && <p role="status" className="text-sm text-muted-foreground">Generating...</p>}
        {qr.isError && <p role="alert" className="text-sm text-destructive">{parseApiError(qr.error).message}</p>}
        {qr.data && <p className="text-sm">{qr.data.data.length} students for {qr.data.year_session}. First row: <code className="break-all text-xs">{JSON.stringify(qr.data.data[0])}</code></p>}
      </fieldset>
    </div>
  )
}
