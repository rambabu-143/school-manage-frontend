"use client"

import { useState } from "react"

import { DownloadButton } from "@/components/shared/download-button"
import { SectionSelect } from "@/components/section-select"
import { SECTION_CERTIFICATES } from "@/lib/ops/resources"

export default function Page() {
  const [section, setSection] = useState<string>()
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Section-wise certificates</h1>
      <div className="w-64 space-y-1.5"><span className="text-sm font-medium">Section</span><SectionSelect value={section} onChange={setSection} /></div>
      {section ? (
        <div className="flex flex-wrap gap-2">
          {SECTION_CERTIFICATES.map((c) => (
            <DownloadButton key={c.label} path={c.path.replace("{section_id}", section)} fallbackName={`${c.label}.json`}>{c.label}</DownloadButton>
          ))}
        </div>
      ) : <p className="text-sm text-muted-foreground">Choose a section to generate its certificates.</p>}
    </div>
  )
}
