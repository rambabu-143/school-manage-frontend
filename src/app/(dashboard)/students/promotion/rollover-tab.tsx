"use client"

import * as React from "react"

import { AcademicYearSelect } from "@/components/academic-year-select"
import { SectionSelect } from "@/components/section-select"
import { Label } from "@/components/ui/label"
import { useGrades } from "@/hooks/use-grades"
import { useSections } from "@/hooks/use-sections"
import {
  usePromoteComboSection, usePromoteHouse, usePromoteStaff, usePromoteStandard, usePromoteSubjects,
} from "@/hooks/use-session-promotion"
import { useSubjects } from "@/hooks/use-subjects"
import {
  buildComboSectionBody, buildHouseBody, buildStaffBody, buildStandardBody, buildSubjectsBody,
} from "@/lib/promotion-payloads"
import { toggleId } from "@/lib/hr/rows"

import { Checklist, OpCard } from "./op-card"

export function RolloverTab() {
  const { data: grades } = useGrades()
  const { data: subjects } = useSubjects()
  const { data: sections } = useSections()
  const [gradeIds, setGradeIds] = React.useState<string[]>([])
  const [subjectIds, setSubjectIds] = React.useState<string[]>([])
  const [comboSecs, setComboSecs] = React.useState<string[]>([])
  const [comboYear, setComboYear] = React.useState<string>()
  const [nextClass, setNextClass] = React.useState(false)
  const [staffSecs, setStaffSecs] = React.useState<string[]>([])
  const [staffYear, setStaffYear] = React.useState<string>()
  const [houseSec, setHouseSec] = React.useState<string>()

  const standard = usePromoteStandard()
  const subj = usePromoteSubjects()
  const combo = usePromoteComboSection()
  const staff = usePromoteStaff()
  const house = usePromoteHouse()

  const gradeItems = grades?.map((g) => ({ id: g.id, label: g.name }))
  const subjectItems = subjects?.map((s) => ({ id: s.id, label: `${s.name} (${s.code})` }))
  const sectionItems = sections?.map((s) => ({ id: s.id, label: `${grades?.find((g) => g.id === s.grade_id)?.name ?? "?"} - ${s.name}` }))

  const standardBody = buildStandardBody(gradeIds)
  const subjectsBody = buildSubjectsBody(subjectIds)
  const comboBody = buildComboSectionBody(comboSecs, comboYear, nextClass)
  const staffBody = buildStaffBody(staffSecs, staffYear)
  const houseBody = buildHouseBody(houseSec)

  return (
    <div className="flex flex-col gap-4">
      <OpCard title="Promote standards" description="Carry the selected grades into the next session." countLabel={`${standardBody?.grade_ids.length ?? 0} grade(s)`}
        ready={!!standardBody} isPending={standard.isPending} error={standard.error} result={standard.data}
        onRun={() => standardBody && standard.mutate(standardBody)}>
        <Checklist items={gradeItems} picked={gradeIds} onToggle={(id) => setGradeIds((p) => toggleId(p, id))} empty="No grades." />
      </OpCard>

      <OpCard title="Promote subjects" description="Validate and carry the selected subjects into the next session." countLabel={`${subjectsBody?.subject_ids.length ?? 0} subject(s)`}
        ready={!!subjectsBody} isPending={subj.isPending} error={subj.error} result={subj.data}
        onRun={() => subjectsBody && subj.mutate(subjectsBody)}>
        <Checklist items={subjectItems} picked={subjectIds} onToggle={(id) => setSubjectIds((p) => toggleId(p, id))} empty="No subjects." />
      </OpCard>

      <OpCard title="Promote combo sections" description="Copy combo links of the selected sections onto their target-year sections." countLabel={`${comboBody?.section_ids.length ?? 0} section(s) into the chosen target year`}
        ready={!!comboBody} isPending={combo.isPending} error={combo.error} result={combo.data}
        onRun={() => comboBody && combo.mutate(comboBody)}>
        <div className="max-w-sm space-y-1"><Label>Target academic year</Label><AcademicYearSelect value={comboYear} onChange={setComboYear} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={nextClass} onChange={(e) => setNextClass(e.target.checked)} /> Promote into the next class</label>
        <Checklist items={sectionItems} picked={comboSecs} onToggle={(id) => setComboSecs((p) => toggleId(p, id))} empty="No sections." />
      </OpCard>

      <OpCard title="Promote class teachers" description="Copy each section's class teacher to the target-year section. Existing teachers are not overwritten." countLabel={`${staffBody?.section_ids.length ?? 0} section(s) into the chosen target year`}
        ready={!!staffBody} isPending={staff.isPending} error={staff.error} result={staff.data}
        onRun={() => staffBody && staff.mutate(staffBody)}>
        <div className="max-w-sm space-y-1"><Label>Target academic year</Label><AcademicYearSelect value={staffYear} onChange={setStaffYear} /></div>
        <Checklist items={sectionItems} picked={staffSecs} onToggle={(id) => setStaffSecs((p) => toggleId(p, id))} empty="No sections." />
      </OpCard>

      <OpCard title="Promote houses" description="Re-map house memberships of one (already promoted) section to same-named houses in each student's branch." countLabel="1 section"
        ready={!!houseBody} isPending={house.isPending} error={house.error} result={house.data}
        onRun={() => houseBody && house.mutate(houseBody)}>
        <div className="max-w-sm space-y-1"><Label>Section</Label><SectionSelect value={houseSec} onChange={setHouseSec} /></div>
      </OpCard>
    </div>
  )
}
