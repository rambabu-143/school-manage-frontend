"use client"

import { Suspense } from "react"
import { z } from "zod"
import type { ColumnDef } from "@tanstack/react-table"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CrudPage } from "@/components/shared/crud-page"
import { DownloadButton } from "@/components/shared/download-button"
import { FileUpload } from "@/components/shared/file-upload"
import { ReportFilterBar } from "@/components/shared/report-filter-bar"
import { ServerDataTable } from "@/components/shared/server-data-table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CSV_RULE, IMAGE_RULE } from "@/lib/shared/file-validation"

type Grade = { id: string; name: string }
const columns: ColumnDef<Grade, unknown>[] = [{ accessorKey: "name", header: "Name" }]
const schema = z.object({ name: z.string().min(1, "Name is required").max(100) })

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 rounded-lg border p-4"><h2 className="font-medium">{title}</h2>{children}</section>
}

export function DevComponents() {
  const [confirm, setConfirm] = useState(false)
  return (
    <Suspense>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Shared components (dev only)</h1>
        <Section title="File upload (CSV, 10 MB)"><FileUpload path="/dev/none" rule={CSV_RULE} /></Section>
        <Section title="File upload (image)"><FileUpload path="/dev/none" rule={IMAGE_RULE} /></Section>
        <Section title="Download button"><DownloadButton path="/dev/none" fallbackName="demo.pdf">Download PDF</DownloadButton></Section>
        <Section title="Report filter bar (URL synced)"><ReportFilterBar /></Section>
        <Section title="Server data table (empty/error states)">
          <ServerDataTable columns={columns} rows={[]} total={0} />
          <ServerDataTable columns={columns} rows={undefined} error="Could not load data." onRetry={() => {}} />
        </Section>
        <Section title="Confirm dialog">
          <Button variant="destructive" onClick={() => setConfirm(true)}>Delete something</Button>
          <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Delete item?" description="Deletes item X permanently." destructive confirmLabel="Delete" onConfirm={() => setConfirm(false)} />
        </Section>
        <Section title="CRUD page template (grades endpoint)">
          <CrudPage<Grade, z.infer<typeof schema>>
            cfg={{ noun: "grade", title: "Grades", queryKey: "dev-grades", path: "/grades", columns, schema, fields: [{ name: "name", label: "Name" }], defaults: { name: "" }, rowLabel: (r) => r.name }}
          />
        </Section>
      </div>
    </Suspense>
  )
}
