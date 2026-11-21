"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"

import { ExamSelect } from "@/components/exam-select"
import { SectionSelect } from "@/components/section-select"
import { SubjectSelect } from "@/components/subject-select"
import { DataTable } from "@/components/data-table/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  useCreateDatesheetEntry,
  useDatesheetEntries,
  useDatesheetEntry,
  useDeleteDatesheetEntry,
  useUpdateDatesheetEntry,
} from "@/hooks/use-datesheet"
import { datesheetChanges } from "@/lib/comms"
import { useSections } from "@/hooks/use-sections"
import { useSubjects } from "@/hooks/use-subjects"
import type { DatesheetEntry } from "@/types/datesheet"

export function DatesheetTab() {
  const [examId, setExamId] = React.useState<string>()
  const { data: entries, isPending } = useDatesheetEntries({ examId })
  const { data: sections } = useSections()
  const { data: subjects } = useSubjects()
  const deleteEntry = useDeleteDatesheetEntry()
  const [editId, setEditId] = React.useState<string>()
  const [deleting, setDeleting] = React.useState<DatesheetEntry | null>(null)

  const sectionsById = new Map(sections?.map((s) => [s.id, s]))
  const subjectsById = new Map(subjects?.map((s) => [s.id, s]))

  const columns: ColumnDef<DatesheetEntry>[] = [
    { accessorKey: "exam_date", header: "Date" },
    {
      id: "time",
      header: "Time",
      cell: ({ row }) => `${row.original.start_time} - ${row.original.end_time}`,
    },
    {
      id: "section",
      header: "Section",
      cell: ({ row }) => sectionsById.get(row.original.section_id)?.name ?? "—",
    },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => subjectsById.get(row.original.subject_id)?.name ?? "—",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" aria-label="Edit entry" onClick={() => setEditId(row.original.id)}>
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Delete entry"
            disabled={deleteEntry.isPending}
            onClick={() => setDeleting(row.original)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs flex flex-col gap-2">
        <Label>Exam</Label>
        <ExamSelect value={examId} onChange={setExamId} />
      </div>

      {examId ? (
        <>
          <div className="flex justify-end">
            <AddEntrySheet examId={examId} />
          </div>
          <DataTable
            columns={columns}
            data={entries ?? []}
            isLoading={isPending}
            emptyMessage="No datesheet entries for this exam yet."
          />
          <EditEntrySheet id={editId} onClose={() => setEditId(undefined)} />
          <ConfirmDialog
            open={!!deleting}
            onOpenChange={(o) => !o && setDeleting(null)}
            title="Delete datesheet entry?"
            description={`Remove the ${deleting?.exam_date ?? ""} entry (${subjectsById.get(deleting?.subject_id ?? "")?.name ?? "subject"}) from this datesheet?`}
            confirmLabel="Delete"
            destructive
            isPending={deleteEntry.isPending}
            onConfirm={() => deleting && deleteEntry.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Select an exam to view its datesheet.</p>
      )}
    </div>
  )
}

function AddEntrySheet({ examId }: { examId: string }) {
  const [open, setOpen] = React.useState(false)
  const [sectionId, setSectionId] = React.useState<string>()
  const [subjectId, setSubjectId] = React.useState<string>()
  const [examDate, setExamDate] = React.useState("")
  const [startTime, setStartTime] = React.useState("")
  const [endTime, setEndTime] = React.useState("")
  const createEntry = useCreateDatesheetEntry()

  function reset() {
    setSectionId(undefined)
    setSubjectId(undefined)
    setExamDate("")
    setStartTime("")
    setEndTime("")
  }

  const ready = sectionId && subjectId && examDate && startTime && endTime

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
          Add Entry
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Datesheet Entry</SheetTitle>
          <SheetDescription>Schedule a subject for a section in this exam.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label>Section</Label>
            <SectionSelect value={sectionId} onChange={setSectionId} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Subject</Label>
            <SubjectSelect value={subjectId} onChange={setSubjectId} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Date</Label>
            <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Start time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>End time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button
            disabled={!ready || createEntry.isPending}
            onClick={() => {
              if (!sectionId || !subjectId || !examDate || !startTime || !endTime) return
              createEntry.mutate(
                {
                  exam_id: examId,
                  section_id: sectionId,
                  subject_id: subjectId,
                  exam_date: examDate,
                  start_time: startTime,
                  end_time: endTime,
                },
                { onSuccess: () => { setOpen(false); reset() } }
              )
            }}
          >
            {createEntry.isPending && <Loader2 className="animate-spin" />}
            Add entry
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function EditEntrySheet({ id, onClose }: { id: string | undefined; onClose: () => void }) {
  const { data: entry, isPending } = useDatesheetEntry(id)

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Datesheet Entry</SheetTitle>
          <SheetDescription>Exam and section are fixed; change the subject or schedule.</SheetDescription>
        </SheetHeader>
        {isPending || !entry ? (
          <p className="px-4 text-sm text-muted-foreground">Loading...</p>
        ) : (
          <EditEntryForm key={entry.id} entry={entry} onClose={onClose} />
        )}
      </SheetContent>
    </Sheet>
  )
}

function EditEntryForm({ entry, onClose }: { entry: DatesheetEntry; onClose: () => void }) {
  const update = useUpdateDatesheetEntry()
  const [subjectId, setSubjectId] = React.useState<string | undefined>(entry.subject_id)
  const [examDate, setExamDate] = React.useState(entry.exam_date)
  const [startTime, setStartTime] = React.useState(entry.start_time.slice(0, 5))
  const [endTime, setEndTime] = React.useState(entry.end_time.slice(0, 5))
  const [error, setError] = React.useState<string>()

  function save() {
    if (!subjectId) return
    const { body, error: err } = datesheetChanges(entry, {
      subject_id: subjectId, exam_date: examDate, start_time: startTime, end_time: endTime,
    })
    setError(err)
    if (err) return
    if (Object.keys(body).length === 0) return onClose()
    update.mutate({ id: entry.id, input: body }, { onSuccess: onClose })
  }

  return (
    <>
      <div className="flex flex-col gap-4 px-4">
        <div className="flex flex-col gap-2">
          <Label>Subject</Label>
          <SubjectSelect value={subjectId} onChange={setSubjectId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Date</Label>
          <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Start time</Label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>End time</Label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
      <SheetFooter>
        <Button disabled={update.isPending} onClick={save}>
          {update.isPending && <Loader2 className="animate-spin" />}
          Save changes
        </Button>
      </SheetFooter>
    </>
  )
}
