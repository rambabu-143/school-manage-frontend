"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { toast } from "sonner"

import { FileUpload } from "@/components/shared/file-upload"
import { qk } from "@/lib/query-keys"
import { IMAGE_RULE } from "@/lib/shared/file-validation"
import { errorMessage } from "@/lib/error-message"
import { api } from "@/lib/typed-api"
import { useSession } from "@/hooks/use-session"
import { ADMIN_ROLES } from "@/types/auth"

type PhotoResult = { passed: boolean; reason: string }

/** Student photo + guardian photo uploads and the medical change history. */
export function StudentExtras({ studentId, guardians }: { studentId: string; guardians: { id: string; name: string }[] }) {
  const qc = useQueryClient()
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)
  // Backend 403s accountants on medical history.
  const canSeeMedical = isAdmin || user?.role === "teacher"
  const history = useQuery({
    enabled: canSeeMedical,
    queryKey: qk("student-medical-history", studentId),
    queryFn: () => api("get", "/students/{student_id}/medical-history", { path: { student_id: studentId } }),
  })
  const upload = (path: string) => (
    <FileUpload<PhotoResult>
      path={path}
      successMessage={(r) => (r.passed ? "Upload complete." : null)}
      rule={IMAGE_RULE}
      onSuccess={(r) => {
        if (r.passed) qc.invalidateQueries({ queryKey: qk("students") })
        else toast.error(`Photo rejected: ${r.reason}`)
      }}
    />
  )
  return (
    <div className="space-y-4">
      {isAdmin && <section aria-label="Photos" className="space-y-2">
        <h3 className="text-sm font-medium">Student photo (PNG/JPEG)</h3>
        {upload(`/students/${studentId}/photo`)}
        {guardians.map((g) => (
          <div key={g.id} className="space-y-1">
            <h4 className="text-xs font-medium">Photo of {g.name}</h4>
            {upload(`/students/${studentId}/guardians/${g.id}/photo`)}
          </div>
        ))}
      </section>}
      {canSeeMedical && <section aria-label="Medical history" className="space-y-2">
        <h3 className="text-sm font-medium">Medical history</h3>
        {history.isPending ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : history.isError ? (
          <p role="alert" className="text-sm text-destructive">{errorMessage(history.error)}</p>
        ) : history.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No medical changes recorded.</p>
        ) : (
          <ul className="space-y-2 text-xs">
            {history.data.map((h) => (
              <li key={h.id} className="rounded-md border p-2">
                <div className="text-muted-foreground">{new Date(h.created_at).toLocaleString()} by {h.updated_by_email ?? "unknown"}</div>
                {Object.entries(h.changes).map(([field, c]) => (
                  <div key={field}>{field}: {String((c as Record<string, string | null>).old ?? "-")} to {String((c as Record<string, string | null>).new ?? "-")}</div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </section>}
    </div>
  )
}
