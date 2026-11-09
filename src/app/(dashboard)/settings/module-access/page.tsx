"use client"

import { useState } from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccessCatalog, useAccessGroups } from "@/hooks/use-settings"

// Read-only: the write API takes the legacy nested checkbox tree, so editing stays out of scope.
export default function ModuleAccessPage() {
  const [year, setYear] = useState<string>()
  const catalog = useAccessCatalog()
  const groups = useAccessGroups(year)
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Module access</h1>
      <div className="max-w-sm"><AcademicYearSelect value={year} onChange={setYear} /></div>
      {!year ? <p className="text-sm text-muted-foreground">Pick an academic year.</p>
        : catalog.isPending || groups.isPending ? <Skeleton className="h-40" />
        : catalog.isError || groups.isError ? <p role="alert" className="text-sm text-destructive">Could not load module access.</p>
        : groups.data.length === 0 ? <p className="text-sm text-muted-foreground">No access groups for this year.</p> : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left">
                <th scope="col" className="p-2">Module</th>
                {groups.data.map((g) => <th scope="col" key={g.id} className="p-2">{g.access_group_name}{g.staff_type ? <span className="block text-xs font-normal text-muted-foreground">{g.staff_type}</span> : null}</th>)}
              </tr></thead>
              <tbody>
                {catalog.data.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <th scope="row" className="p-2 text-left font-normal">{m.label ?? m.sub_module_name}</th>
                    {groups.data.map((g) => <td key={g.id} className="p-2">{g.modules.includes(m.id) ? <span aria-label="granted">Yes</span> : <span aria-label="not granted" className="text-muted-foreground">-</span>}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}
