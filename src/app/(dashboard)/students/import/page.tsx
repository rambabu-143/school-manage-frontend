"use client"

import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { FileUpload } from "@/components/shared/file-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { qk } from "@/lib/query-keys"
import { IMPORT_RULE } from "@/lib/shared/file-validation"

// Each importer is a CSV or XLSX upload; the backend answers {counter: n} or 422 with detail.errors[{row,message}].
const IMPORTS = [
  { path: "/bulk-imports/students/registration-numbers", title: "Registration numbers", help: "Columns: Admission No, Year Session, Registration No. Class IX or XI students only." },
  { path: "/bulk-imports/students/pen-numbers", title: "PEN numbers", help: "Columns: Admission No, Pen No." },
  { path: "/bulk-imports/students/medical", title: "Medical details", help: "Columns: Admission No, Blood Group, Allergies. Changes are kept in each student's medical history." },
  { path: "/bulk-imports/alumni", title: "Alumni", help: "Create alumni records. Columns: Admission No, Graduation Year (optional: Current Institution, Occupation, Employer, Email, Phone, Notes)." },
] as const

export default function BulkImportPage() {
  const qc = useQueryClient()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Bulk import</h1>
        <p className="text-sm text-muted-foreground">
          Upload a CSV or XLSX (max 10 MB, 5000 rows). Rows with problems are listed with their row number; fix the file and upload again.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {IMPORTS.map((imp) => (
          <Card key={imp.path}>
            <CardHeader>
              <CardTitle>{imp.title}</CardTitle>
              <CardDescription>{imp.help}</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload<Record<string, number>>
                path={imp.path}
                rule={IMPORT_RULE}
                onSuccess={(r) => {
                  qc.invalidateQueries({ queryKey: qk("students") })
                  qc.invalidateQueries({ queryKey: qk("alumni") })
                  toast.success(
                    Object.entries(r ?? {}).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`).join(", ") || "Import complete"
                  )
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
