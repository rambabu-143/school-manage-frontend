"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { BranchSelect } from "@/components/branch-select"
import { SESSION_CONTEXT_KEY } from "@/lib/query-keys"

export type Scope = { branch_id?: string; academic_year_id?: string }

/** Branch (+ academic year) selection, defaulting to the session's active context. */
export function useScope(mode?: "branch" | "branch+year") {
  const ctx = useQuery<{ branch_id: string | null; academic_year_id: string | null } | null>({ queryKey: SESSION_CONTEXT_KEY, enabled: false }).data
  const [picked, setPicked] = useState<Scope>({})
  const scope: Scope = {
    branch_id: picked.branch_id ?? ctx?.branch_id ?? undefined,
    academic_year_id: mode === "branch+year" ? (picked.academic_year_id ?? ctx?.academic_year_id ?? undefined) : undefined,
  }
  return { scope, setPicked: (p: Scope) => setPicked((s) => ({ ...s, ...p })) }
}

export function ScopeBar({ mode, scope, onChange }: { mode?: "branch" | "branch+year"; scope: Scope; onChange: (p: Scope) => void }) {
  if (!mode) return null
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-56 space-y-1.5">
        <span className="text-sm font-medium">Branch</span>
        <BranchSelect value={scope.branch_id} onChange={(v) => onChange({ branch_id: v })} />
      </div>
      {mode === "branch+year" && (
        <div className="w-56 space-y-1.5">
          <span className="text-sm font-medium">Academic year</span>
          <AcademicYearSelect value={scope.academic_year_id} onChange={(v) => onChange({ academic_year_id: v })} />
        </div>
      )}
    </div>
  )
}
