"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { BranchSelect } from "@/components/branch-select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/hooks/use-session"
import { errorMessage } from "@/lib/error-message"
import { qk } from "@/lib/query-keys"
import { api } from "@/lib/typed-api"

function useScope() {
  const [branch, setBranch] = useState<string>()
  const [year, setYear] = useState<string>()
  const picker = (
    <div className="grid gap-2 sm:grid-cols-2">
      <BranchSelect value={branch} onChange={setBranch} />
      <AcademicYearSelect value={year} onChange={setYear} />
    </div>
  )
  return { branch, year, picker }
}

function Uploads() {
  const { branch, year, picker } = useScope()
  const { data: user } = useSession()
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: qk("app-uploads", branch, year),
    queryFn: () => api("get", "/app-uploads", { query: { branch_id: branch!, academic_year_id: year! } }),
    enabled: !!branch && !!year,
  })
  const del = useMutation({
    mutationFn: (id: string) => api("delete", "/app-uploads/{upload_id}", { path: { upload_id: id } }),
    onSuccess: () => { toast.success("Upload deleted"); qc.invalidateQueries({ queryKey: qk("app-uploads") }) },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const canDelete = user?.role !== "teacher"
  return (
    <div className="space-y-3">
      {picker}
      {!branch || !year ? <p className="text-sm text-muted-foreground">Pick a branch and academic year.</p> : q.isPending ? <Skeleton className="h-20" /> : q.isError ? (
        <p role="alert" className="text-sm text-destructive">Could not load uploads. <Button variant="link" onClick={() => q.refetch()}>Retry</Button></p>
      ) : q.data.length === 0 ? <p className="text-sm text-muted-foreground">No app uploads.</p> : (
        <ul className="divide-y rounded-lg border">{q.data.map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-2 p-3 text-sm">
            <span><b>{u.title}</b> <span className="text-muted-foreground">to {u.receiver_type}{u.sent_by_name ? ` by ${u.sent_by_name}` : ""}</span></span>
            {canDelete && <Button size="sm" variant="outline" disabled={del.isPending} aria-label={`Delete ${u.title}`} onClick={() => del.mutate(u.id)}>Delete</Button>}
          </li>))}
        </ul>
      )}
    </div>
  )
}

function BoardResults() {
  const { branch, year, picker } = useScope()
  const [cls, setCls] = useState<"X" | "XII">("X")
  const q = useQuery({
    queryKey: qk("board-results", branch, year, cls),
    queryFn: () => api("get", "/board-results/analysis/{class_name}", { path: { class_name: cls }, query: { branch_id: branch!, academic_year_id: year! } }),
    enabled: !!branch && !!year,
  })
  return (
    <div className="space-y-3">
      {picker}
      <label htmlFor="br-c" className="text-sm font-medium">Class </label>
      <select id="br-c" className="h-9 rounded-md border bg-background px-2 text-sm" value={cls} onChange={(e) => setCls(e.target.value as "X" | "XII")}><option>X</option><option>XII</option></select>
      {!branch || !year ? <p className="text-sm text-muted-foreground">Pick a branch and academic year.</p> : q.isPending ? <Skeleton className="h-20" /> : q.isError ? (
        <p role="alert" className="text-sm text-destructive">Could not load results.</p>
      ) : q.data.length === 0 ? <p className="text-sm text-muted-foreground">No board results uploaded.</p> : (
        <div className="overflow-x-auto rounded-lg border"><table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th scope="col" className="p-2">Roll</th><th scope="col" className="p-2">Name</th><th scope="col" className="p-2">Section</th></tr></thead>
          <tbody>{q.data.map((r) => <tr key={r.id} className="border-b last:border-0"><td className="p-2">{r.roll_number}</td><td className="p-2">{r.name}</td><td className="p-2">{r.current_section_name ?? r.section_name}</td></tr>)}</tbody>
        </table></div>
      )}
    </div>
  )
}

export default function StudentRecordsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Student records</h1>
      <Tabs defaultValue="uploads">
        <TabsList><TabsTrigger value="uploads">App uploads</TabsTrigger><TabsTrigger value="board">Board results</TabsTrigger></TabsList>
        <TabsContent value="uploads"><Uploads /></TabsContent>
        <TabsContent value="board"><BoardResults /></TabsContent>
      </Tabs>
      <p className="text-xs text-muted-foreground">App versions are managed under Settings, App settings.</p>
    </div>
  )
}
