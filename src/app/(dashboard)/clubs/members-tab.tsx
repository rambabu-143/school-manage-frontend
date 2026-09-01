"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { ClubSelect } from "@/components/club-select"
import { DataTable } from "@/components/data-table/data-table"
import { StudentSelect } from "@/components/student-select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  useAddClubMember,
  useClubMemberships,
  useRemoveClubMember,
} from "@/hooks/use-club-memberships"
import { useStudents } from "@/hooks/use-students"
import type { ClubMembership } from "@/types/clubs"

export function MembersTab() {
  const [clubId, setClubId] = React.useState<string>()
  const { data: memberships, isPending } = useClubMemberships({ clubId })
  const { data: students } = useStudents()
  const removeMember = useRemoveClubMember()

  const studentsById = new Map(students?.map((s) => [s.id, s]))

  const columns: ColumnDef<ClubMembership>[] = [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = studentsById.get(row.original.student_id)
        return student ? `${student.first_name} ${student.last_name}` : "—"
      },
    },
    { accessorKey: "joined_date", header: "Joined" },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={removeMember.isPending}
          onClick={() => removeMember.mutate(row.original.id)}
        >
          <Trash2 />
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-w-xs flex-col gap-2">
        <Label>Club</Label>
        <ClubSelect value={clubId} onChange={setClubId} />
      </div>

      {clubId ? (
        <>
          <div className="flex justify-end">
            <AddMemberSheet clubId={clubId} />
          </div>
          <DataTable
            columns={columns}
            data={memberships ?? []}
            isLoading={isPending}
            emptyMessage="No members yet."
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Select a club to view its members.</p>
      )}
    </div>
  )
}

function AddMemberSheet({ clubId }: { clubId: string }) {
  const [open, setOpen] = React.useState(false)
  const [studentId, setStudentId] = React.useState<string>()
  const addMember = useAddClubMember()

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setStudentId(undefined)
      }}
    >
      <SheetTrigger asChild>
        <Button>
          <Plus />
          Add Member
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Member</SheetTitle>
          <SheetDescription>Add a student to this club.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label>Student</Label>
            <StudentSelect value={studentId} onChange={setStudentId} />
          </div>
        </div>
        <SheetFooter>
          <Button
            disabled={!studentId || addMember.isPending}
            onClick={() => {
              if (!studentId) return
              addMember.mutate(
                { club_id: clubId, student_id: studentId },
                { onSuccess: () => { setOpen(false); setStudentId(undefined) } }
              )
            }}
          >
            {addMember.isPending && <Loader2 className="animate-spin" />}
            Add member
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
