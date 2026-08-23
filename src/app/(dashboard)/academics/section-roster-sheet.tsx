"use client"

import * as React from "react"
import { ArrowUpRight, Loader2, Plus, X } from "lucide-react"

import { StudentSelect } from "@/components/student-select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useAcademicYears } from "@/hooks/use-academic-years"
import { useEnrollStudent, useEnrollments, useWithdrawEnrollment } from "@/hooks/use-enrollments"
import { useGrades } from "@/hooks/use-grades"
import { usePromoteStudents, useSections } from "@/hooks/use-sections"
import { useStudents } from "@/hooks/use-students"
import type { Section } from "@/types/academics"

interface SectionRosterSheetProps {
  section: Section | null
  onOpenChange: (open: boolean) => void
}

export function SectionRosterSheet({ section, onOpenChange }: SectionRosterSheetProps) {
  const { data: enrollments, isPending: enrollmentsPending } = useEnrollments(section?.id)
  const { data: students } = useStudents()
  const { data: grades } = useGrades()
  const { data: years } = useAcademicYears()
  const { data: allSections } = useSections()

  const [newStudentId, setNewStudentId] = React.useState<string>()
  const [targetSectionId, setTargetSectionId] = React.useState<string>()
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const enrollStudent = useEnrollStudent()
  const withdrawEnrollment = useWithdrawEnrollment()
  const promoteStudents = usePromoteStudents()

  if (!section) return null

  const studentById = new Map(students?.map((s) => [s.id, s]))
  const enrolledStudentIds = enrollments?.map((e) => e.student_id) ?? []
  const grade = grades?.find((g) => g.id === section.grade_id)
  const year = years?.find((y) => y.id === section.academic_year_id)

  function sectionLabel(target: Section) {
    const targetGrade = grades?.find((g) => g.id === target.grade_id)
    const targetYear = years?.find((y) => y.id === target.academic_year_id)
    return `${targetGrade?.name ?? "?"} - ${target.name} (${targetYear?.name ?? "?"})`
  }

  function toggleSelected(studentId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  function onEnroll() {
    if (!section || !newStudentId) return
    enrollStudent.mutate(
      { student_id: newStudentId, section_id: section.id },
      { onSuccess: () => setNewStudentId(undefined) }
    )
  }

  function onPromote() {
    if (!section || !targetSectionId || selected.size === 0) return
    promoteStudents.mutate(
      {
        sectionId: section.id,
        studentIds: Array.from(selected),
        targetSectionId,
      },
      { onSuccess: () => setSelected(new Set()) }
    )
  }

  return (
    <Sheet open={!!section} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {grade?.name ?? "Section"} - {section.name}
          </SheetTitle>
          <SheetDescription>
            {year?.name} &middot; {enrollments?.length ?? 0} enrolled
            {section.capacity ? ` of ${section.capacity}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div className="flex flex-col gap-3">
            <Label>Enroll a student</Label>
            <div className="flex gap-2">
              <StudentSelect
                value={newStudentId}
                onChange={setNewStudentId}
                excludeIds={enrolledStudentIds}
              />
              <Button
                onClick={onEnroll}
                disabled={!newStudentId || enrollStudent.isPending}
              >
                {enrollStudent.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                Enroll
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <Label>Roster</Label>
            {enrollmentsPending && (
              <p className="text-sm text-muted-foreground">Loading roster...</p>
            )}
            {!enrollmentsPending && enrollments?.length === 0 && (
              <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
            )}
            {enrollments?.map((enrollment) => {
              const student = studentById.get(enrollment.student_id)
              return (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selected.has(enrollment.student_id)}
                      onCheckedChange={() => toggleSelected(enrollment.student_id)}
                    />
                    <div>
                      <div className="font-medium">
                        {student
                          ? `${student.first_name} ${student.last_name}`
                          : "Unknown student"}
                      </div>
                      <div className="text-muted-foreground">
                        Enrolled {enrollment.enrolled_date}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={withdrawEnrollment.isPending}
                    onClick={() => withdrawEnrollment.mutate(enrollment.id)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )
            })}
          </div>

          {selected.size > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-3 rounded-md border border-dashed p-3">
                <Label>Promote {selected.size} selected to...</Label>
                <Select value={targetSectionId} onValueChange={setTargetSectionId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select target section" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSections
                      ?.filter((s) => s.id !== section.id)
                      .map((target) => (
                        <SelectItem key={target.id} value={target.id}>
                          {sectionLabel(target)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  disabled={!targetSectionId || promoteStudents.isPending}
                  onClick={onPromote}
                >
                  {promoteStudents.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ArrowUpRight />
                  )}
                  Promote
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
