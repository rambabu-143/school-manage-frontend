"use client"

import { Suspense, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { BranchSelect } from "@/components/branch-select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ServerDataTable } from "@/components/shared/server-data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useBirthdayWishes, useSave } from "@/hooks/use-attendance-admin"
import { useListParams } from "@/hooks/shared/use-url-params"
import { api } from "@/lib/typed-api"
import { parseApiError } from "@/lib/shared/api-error"

type Wish = { id: string; branch_id: string; academic_year_id: string; type: string; text: string | null; file_name: string }

function WishDialog({ wish, onClose }: { wish: Wish | "new"; onClose: () => void }) {
  const isNew = wish === "new"
  const [v, setV] = useState({ branch_id: isNew ? "" : wish.branch_id, academic_year_id: isNew ? "" : wish.academic_year_id, type: isNew ? "STUDENT" : wish.type, text: isNew ? "" : (wish.text ?? ""), file_name: isNew ? "" : wish.file_name })
  const [err, setErr] = useState("")
  const save = useSave<typeof v>("birthday-wishes", (b) =>
    isNew ? api("post", "/birthday-wishes", { body: { ...b, type: b.type as "STUDENT" | "STAFF", text: b.text || null } })
      : api("put", "/birthday-wishes/{wish_id}", { path: { wish_id: wish.id }, body: { type: b.type as "STUDENT" | "STAFF", text: b.text || null, file_name: b.file_name } }), "Template saved", onClose)
  const set = (k: keyof typeof v, x: string) => setV((p) => ({ ...p, [k]: x }))
  return (
    <Dialog open onOpenChange={(o) => !o && !save.isPending && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isNew ? "New birthday template" : "Edit birthday template"}</DialogTitle></DialogHeader>
        <form className="space-y-3" noValidate onSubmit={(e) => {
          e.preventDefault()
          if (!v.file_name.trim() || (isNew && (!v.branch_id || !v.academic_year_id))) { setErr("Branch, academic year and file name are required"); return }
          setErr(""); save.mutate(v)
        }}>
          {isNew && <><div className="space-y-1"><Label>Branch</Label><BranchSelect value={v.branch_id || undefined} onChange={(x) => set("branch_id", x)} /></div>
            <div className="space-y-1"><Label>Academic year</Label><AcademicYearSelect value={v.academic_year_id || undefined} onChange={(x) => set("academic_year_id", x)} /></div></>}
          <div className="space-y-1"><Label htmlFor="bw-type">For</Label>
            <select id="bw-type" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={v.type} onChange={(e) => set("type", e.target.value)}><option value="STUDENT">Students</option><option value="STAFF">Staff</option></select></div>
          <div className="space-y-1"><Label htmlFor="bw-file">Card image file name</Label><Input id="bw-file" value={v.file_name} onChange={(e) => set("file_name", e.target.value)} /></div>
          <div className="space-y-1"><Label htmlFor="bw-text">Message</Label><Textarea id="bw-text" value={v.text} onChange={(e) => set("text", e.target.value)} /></div>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <DialogFooter><Button type="button" variant="outline" disabled={save.isPending} onClick={onClose}>Cancel</Button><Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Body() {
  const lp = useListParams()
  const q = useBirthdayWishes({ page: lp.page, limit: lp.limit })
  const [editing, setEditing] = useState<Wish | "new" | null>(null)
  const [deleting, setDeleting] = useState<Wish | null>(null)
  const del = useSave<Wish>("birthday-wishes", (w) => api("delete", "/birthday-wishes/{wish_id}", { path: { wish_id: w.id } }), "Template deleted", () => setDeleting(null))
  const columns: ColumnDef<Wish, unknown>[] = [
    { accessorKey: "type", header: "For" }, { accessorKey: "file_name", header: "File" },
    { accessorKey: "text", header: "Message", cell: ({ row }) => row.original.text ?? "-" },
    { id: "actions", header: () => <span className="sr-only">Actions</span>, cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="icon-sm" aria-label={`Edit ${row.original.file_name}`} onClick={() => setEditing(row.original)}><Pencil /></Button>
        <Button variant="ghost" size="icon-sm" aria-label={`Delete ${row.original.file_name}`} onClick={() => setDeleting(row.original)}><Trash2 /></Button>
      </div>) },
  ]
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Birthday wishes</h1><Button onClick={() => setEditing("new")}><Plus /> New template</Button></div>
      <ServerDataTable columns={columns} rows={q.data as Wish[] | undefined} isLoading={q.isPending} error={q.isError ? parseApiError(q.error).message : null} onRetry={() => q.refetch()} emptyMessage="No birthday templates yet." />
      {editing && <WishDialog key={editing === "new" ? "new" : editing.id} wish={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title="Delete template?" description={deleting ? `This deletes the template "${deleting.file_name}". Recorded in the audit log.` : ""} confirmLabel="Delete" destructive isPending={del.isPending} onConfirm={() => deleting && del.mutate(deleting)} />
    </div>
  )
}

export default function BirthdayWishesPage() {
  return <Suspense><Body /></Suspense>
}
