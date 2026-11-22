"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Loader2, Pencil, Plus, Trash2 } from "lucide-react"

import { DataTable } from "@/components/data-table/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useSessionScope } from "@/hooks/use-identity"
import {
  useCreateNoticeGroup,
  useDeleteNoticeGroup,
  useNoticeGroupDetail,
  useNoticeGroups,
  useUpdateNoticeGroup,
} from "@/hooks/use-notices"
import { useSession } from "@/hooks/use-session"
import { useStaff } from "@/hooks/use-staff"
import { useStudents } from "@/hooks/use-students"
import { GROUP_ROLES, groupCreateBody } from "@/lib/comms"
import type { NoticeGroup } from "@/types/notices"

function toggle(list: string[], id: string, on: boolean) {
  return on ? [...list, id] : list.filter((x) => x !== id)
}

function MemberList({ title, items, selected, onChange }: {
  title: string
  items: { id: string; label: string }[] | undefined
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{title} ({selected.length})</Label>
      <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-md border p-3">
        {items?.length === 0 && <p className="text-sm text-muted-foreground">None available.</p>}
        {items?.map((m) => (
          <Label key={m.id} className="flex items-center gap-2 font-normal">
            <Checkbox checked={selected.includes(m.id)} onCheckedChange={(c) => onChange(toggle(selected, m.id, c === true))} />
            {m.label}
          </Label>
        ))}
      </div>
    </div>
  )
}

function GroupSheet({ group, onClose }: { group: NoticeGroup | "new" | null; onClose: () => void }) {
  return (
    <Sheet open={!!group} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{group && group !== "new" ? "Edit group" : "New group"}</SheetTitle>
          <SheetDescription>Members are replaced wholesale on save.</SheetDescription>
        </SheetHeader>
        {group && <GroupForm key={group === "new" ? "new" : group.id} group={group} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function GroupForm({ group, onClose }: { group: NoticeGroup | "new"; onClose: () => void }) {
  const editing = group === "new" ? null : group
  const { data: scope } = useSessionScope()
  const { data: students } = useStudents()
  const { data: staff } = useStaff()
  const create = useCreateNoticeGroup()
  const update = useUpdateNoticeGroup()
  const [name, setName] = React.useState(editing?.name ?? "")
  const [studentIds, setStudentIds] = React.useState<string[]>(editing?.student_ids ?? [])
  const [staffIds, setStaffIds] = React.useState<string[]>(editing?.staff_ids ?? [])

  const pending = create.isPending || update.isPending
  function save() {
    const values = { name, student_ids: studentIds, staff_ids: staffIds }
    if (editing) {
      update.mutate({ id: editing.id, input: { ...values, name: name.trim() } }, { onSuccess: onClose })
    } else {
      // Send the session branch so a branch-restricted user always names a branch they can access.
      create.mutate(groupCreateBody(values, scope?.branch_id), { onSuccess: onClose })
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 px-4">
        <div className="flex flex-col gap-2">
          <Label>Name</Label>
          <Input value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
        </div>
        <MemberList title="Students" selected={studentIds} onChange={setStudentIds}
          items={students?.map((s) => ({ id: s.id, label: `${s.first_name} ${s.last_name}` }))} />
        <MemberList title="Staff" selected={staffIds} onChange={setStaffIds}
          items={staff?.map((s) => ({ id: s.id, label: `${s.first_name} ${s.last_name}` }))} />
      </div>
      <SheetFooter>
        <Button disabled={!name.trim() || pending} onClick={save}>
          {pending && <Loader2 className="animate-spin" />}
          {editing ? "Save changes" : "Create group"}
        </Button>
      </SheetFooter>
    </>
  )
}

function DetailDialog({ id, onClose }: { id: string | undefined; onClose: () => void }) {
  const { data, isPending, isError } = useNoticeGroupDetail(id)
  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{data?.name ?? "Group"}</DialogTitle></DialogHeader>
        {isPending && <p className="text-sm text-muted-foreground">Loading...</p>}
        {isError && <p className="text-sm text-destructive">Group not found.</p>}
        {data && (
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto text-sm">
            <div>
              <p className="font-medium">Students ({data.students.length})</p>
              {data.students.map((s) => <p key={s.id} className="text-muted-foreground">{s.name} ({s.admission_number})</p>)}
            </div>
            <div>
              <p className="font-medium">Staff ({data.staff.length})</p>
              {data.staff.map((s) => <p key={s.id} className="text-muted-foreground">{s.name} ({s.employee_number}){s.phone ? ` - ${s.phone}` : ""}</p>)}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function NoticeGroupsTab() {
  const { data: user } = useSession()
  const canWrite = !!user && GROUP_ROLES.includes(user.role) // backend: admins and teachers read and write
  const { data: groups, isPending } = useNoticeGroups()
  const del = useDeleteNoticeGroup()
  const [sheet, setSheet] = React.useState<NoticeGroup | "new" | null>(null)
  const [detailId, setDetailId] = React.useState<string>()
  const [deleting, setDeleting] = React.useState<NoticeGroup | null>(null)

  const columns: ColumnDef<NoticeGroup>[] = [
    { accessorKey: "name", header: "Name" },
    { id: "members", header: "Members", cell: ({ row }) => `${row.original.student_ids.length} student(s), ${row.original.staff_ids.length} staff` },
    { id: "scope", header: "Scope", cell: ({ row }) => (row.original.branch_id ? "Branch" : "Tenant-wide") },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" aria-label="View members" onClick={() => setDetailId(row.original.id)}><Eye /></Button>
          {canWrite && (
            <>
              <Button variant="ghost" size="icon" aria-label="Edit group" onClick={() => setSheet(row.original)}><Pencil /></Button>
              <Button variant="ghost" size="icon" aria-label="Delete group" onClick={() => setDeleting(row.original)}><Trash2 /></Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {canWrite && (
        <div className="flex justify-end">
          <Button onClick={() => setSheet("new")}><Plus />New Group</Button>
        </div>
      )}
      <DataTable columns={columns} data={groups ?? []} isLoading={isPending} emptyMessage="No notice groups yet." />
      <GroupSheet group={sheet} onClose={() => setSheet(null)} />
      <DetailDialog id={detailId} onClose={() => setDetailId(undefined)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete group?"
        description={`Delete notice group "${deleting?.name ?? ""}"? Members are not affected.`}
        confirmLabel="Delete"
        destructive
        isPending={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  )
}
