"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAcademicYears } from "@/hooks/use-academic-years"
import { useBranches } from "@/hooks/use-branches"
import { useSessionScope, useSwitchBranch, useSwitchYear } from "@/hooks/use-identity"

export function ScopeSwitcher() {
  const { data: scope } = useSessionScope()
  const { data: branches } = useBranches()
  const { data: years } = useAcademicYears()
  const branch = useSwitchBranch()
  const year = useSwitchYear()
  // The backend refuses switching while impersonating.
  const locked = !scope || Boolean(scope.impersonation) || branch.isPending || year.isPending

  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Select value={scope?.branch_id ?? undefined} onValueChange={(v) => branch.mutate(v)} disabled={locked || !branches?.length}>
        <SelectTrigger className="h-8 w-44" aria-label="Branch"><SelectValue placeholder="All branches" /></SelectTrigger>
        <SelectContent>
          {branches?.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={scope?.academic_year_id ?? undefined} onValueChange={(v) => year.mutate(v)} disabled={locked || !years?.length}>
        <SelectTrigger className="h-8 w-36" aria-label="Academic year"><SelectValue placeholder="Academic year" /></SelectTrigger>
        <SelectContent>
          {years?.map((y) => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}
