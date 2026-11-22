"use client"

import type { ReactNode } from "react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSeniorExams } from "@/hooks/use-exam-settings"
import { parseApiError } from "@/lib/shared/api-error"

export const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checked} onChange={onChange} />{label}</label>
}

export function Group({ label, children }: { label: string; children: ReactNode }) {
  return <fieldset className="flex flex-col gap-1"><legend className="text-sm font-medium">{label}</legend><div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md border p-2">{children}</div></fieldset>
}

export function ExamChecks({ label, gradeId, yearId, value, onChange }: { label: string; gradeId: string; yearId: string; value: string[]; onChange: (v: string[]) => void }) {
  const q = useSeniorExams(gradeId, yearId)
  return (
    <Group label={label}>
      {q.isError && <p role="alert" className="text-sm text-destructive">{parseApiError(q.error).message}</p>}
      {q.data?.length === 0 && <p className="text-sm text-muted-foreground">No senior exams for this class and year.</p>}
      {q.data?.map((e) => <Check key={e.id} label={e.exam_name} checked={value.includes(e.id)} onChange={() => onChange(toggle(value, e.id))} />)}
    </Group>
  )
}

export function FormDialog({ title, open, onClose, onSubmit, pending, error, children }: {
  title: string; open: boolean; onClose: () => void; onSubmit: () => void; pending: boolean; error?: string; children: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
          {children}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={pending}>Cancel</Button><Button type="submit" disabled={pending}>Save</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SettingsTable<T extends { id: string }>({ rows, loading, error, columns, onEdit, onDelete, name }: {
  rows: T[] | undefined; loading: boolean; error: unknown; columns: { header: string; cell: (r: T) => ReactNode }[]
  onEdit: (r: T) => void; onDelete: (r: T) => void; name: (r: T) => string
}) {
  if (loading) return <p role="status" className="text-sm text-muted-foreground">Loading...</p>
  if (error) return <p role="alert" className="text-sm text-destructive">{parseApiError(error).message}</p>
  if (!rows?.length) return <p className="text-sm text-muted-foreground">Nothing configured yet.</p>
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader><TableRow>{columns.map((c) => <TableHead key={c.header}>{c.header}</TableHead>)}<TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              {columns.map((c) => <TableCell key={c.header}>{c.cell(r)}</TableCell>)}
              <TableCell className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" aria-label={`Edit ${name(r)}`} onClick={() => onEdit(r)}>Edit</Button>
                <Button variant="ghost" size="sm" aria-label={`Delete ${name(r)}`} onClick={() => onDelete(r)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function DeleteConfirm({ target, what, pending, onCancel, onConfirm }: { target: string | null; what: string; pending: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <ConfirmDialog
      open={!!target}
      onOpenChange={(o) => !o && onCancel()}
      title={`Delete ${what}?`}
      description={`This removes "${target}" from exam settings. Reports that use it will no longer include it.`}
      confirmLabel="Delete"
      destructive
      isPending={pending}
      onConfirm={onConfirm}
    />
  )
}
