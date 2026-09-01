"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { DataTable } from "@/components/data-table/data-table"
import { SectionSelect } from "@/components/section-select"
import { StaffSelect } from "@/components/staff-select"
import { SubjectSelect } from "@/components/subject-select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { usePeriods } from "@/hooks/use-periods"
import { useStaff } from "@/hooks/use-staff"
import { useSubjects } from "@/hooks/use-subjects"
import {
  useCreateTimetableEntry,
  useDeleteTimetableEntry,
  useTimetableEntries,
} from "@/hooks/use-timetable"
import { DAY_LABELS, DAYS_OF_WEEK, type DayOfWeek, type TimetableEntry } from "@/types/timetable"

export function ScheduleTab() {
  const [sectionId, setSectionId] = React.useState<string>()
  const { data: entries, isPending } = useTimetableEntries({ sectionId })
  const { data: periods } = usePeriods()
  const { data: subjects } = useSubjects()
  const { data: staff } = useStaff()
  const deleteEntry = useDeleteTimetableEntry()

  const periodsById = new Map(periods?.map((p) => [p.id, p]))
  const subjectsById = new Map(subjects?.map((s) => [s.id, s]))
  const staffById = new Map(staff?.map((s) => [s.id, s]))

  const sorted = [...(entries ?? [])].sort((a, b) => {
    const dayDiff =
      DAYS_OF_WEEK.indexOf(a.day_of_week as DayOfWeek) -
      DAYS_OF_WEEK.indexOf(b.day_of_week as DayOfWeek)
    if (dayDiff !== 0) return dayDiff
    return (periodsById.get(a.period_id)?.sequence ?? 0) - (periodsById.get(b.period_id)?.sequence ?? 0)
  })

  const columns: ColumnDef<TimetableEntry>[] = [
    {
      id: "day",
      header: "Day",
      cell: ({ row }) => DAY_LABELS[row.original.day_of_week as DayOfWeek],
    },
    {
      id: "period",
      header: "Period",
      cell: ({ row }) => periodsById.get(row.original.period_id)?.name ?? "—",
    },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => subjectsById.get(row.original.subject_id)?.name ?? "—",
    },
    {
      id: "staff",
      header: "Teacher",
      cell: ({ row }) => {
        const member = staffById.get(row.original.staff_id)
        return member ? `${member.first_name} ${member.last_name}` : "—"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={deleteEntry.isPending}
          onClick={() => deleteEntry.mutate(row.original.id)}
        >
          <Trash2 />
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs flex flex-col gap-2">
        <Label>Section</Label>
        <SectionSelect value={sectionId} onChange={setSectionId} />
      </div>

      {sectionId ? (
        <>
          <div className="flex justify-end">
            <AddEntrySheet sectionId={sectionId} />
          </div>
          <DataTable
            columns={columns}
            data={sorted}
            isLoading={isPending}
            emptyMessage="No classes scheduled for this section."
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Select a section to view its schedule.</p>
      )}
    </div>
  )
}

function AddEntrySheet({ sectionId }: { sectionId: string }) {
  const [open, setOpen] = React.useState(false)
  const [day, setDay] = React.useState<DayOfWeek>()
  const [periodId, setPeriodId] = React.useState<string>()
  const [subjectId, setSubjectId] = React.useState<string>()
  const [staffId, setStaffId] = React.useState<string>()
  const { data: periods } = usePeriods()
  const createEntry = useCreateTimetableEntry()

  function reset() {
    setDay(undefined)
    setPeriodId(undefined)
    setSubjectId(undefined)
    setStaffId(undefined)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <SheetTrigger asChild>
        <Button>
          <Plus />
          Add Class
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Schedule a Class</SheetTitle>
          <SheetDescription>Assign a subject and teacher to a day and period.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label>Day</Label>
            <Select value={day} onValueChange={(value) => setDay(value as DayOfWeek)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((d) => (
                  <SelectItem key={d} value={d}>
                    {DAY_LABELS[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Period</Label>
            <Select value={periodId} onValueChange={setPeriodId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a period" />
              </SelectTrigger>
              <SelectContent>
                {periods?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Subject</Label>
            <SubjectSelect value={subjectId} onChange={setSubjectId} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Teacher</Label>
            <StaffSelect value={staffId} onChange={setStaffId} />
          </div>
        </div>
        <SheetFooter>
          <Button
            disabled={!day || !periodId || !subjectId || !staffId || createEntry.isPending}
            onClick={() => {
              if (!day || !periodId || !subjectId || !staffId) return
              createEntry.mutate(
                {
                  section_id: sectionId,
                  period_id: periodId,
                  day_of_week: day,
                  subject_id: subjectId,
                  staff_id: staffId,
                },
                {
                  onSuccess: () => {
                    setOpen(false)
                    reset()
                  },
                }
              )
            }}
          >
            {createEntry.isPending && <Loader2 className="animate-spin" />}
            Schedule class
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
