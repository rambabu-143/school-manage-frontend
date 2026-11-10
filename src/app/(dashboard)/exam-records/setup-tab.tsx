"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { z } from "zod"

import { CrudPage, type CrudConfig } from "@/components/shared/crud-page"
import { apiClient } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import type { Role } from "@/types/auth"

import {
  Pick,
  useBranchOptions,
  useGradeOptions,
  useStaffOptions,
  useSubjectOptions,
} from "./pickers"

const ADMINS: Role[] = ["super_admin", "school_admin", "branch_admin"]
const col = <T,>(key: keyof T & string, header: string): ColumnDef<T, unknown> => ({ accessorKey: key, header })
const NONE: Role[] = [] // hides the button: the API has no such operation

const req = (m: string) => z.string().min(1, m)
const seq = z.number().int().min(0).optional()

/** Look up an option label so tables show names, not UUIDs. */
const labeler = (opts?: { value: string; label: string }[]) => (id: string) => opts?.find((o) => o.value === id)?.label ?? id

// -- Grade bands: list + create only ------------------------------------------------------
interface GradeBand { id: string; grade_letter: string; min_percentage: number; max_percentage: number; grade_point?: number | null }
const gradeBandSchema = z.object({
  grade_letter: req("Required").max(5),
  min_percentage: z.number().int().min(0).max(100),
  max_percentage: z.number().int().min(0).max(100),
})
export function GradeBandsTab() {
  const cfg: CrudConfig<GradeBand, z.infer<typeof gradeBandSchema>> = {
    noun: "grade band", title: "Grade bands", queryKey: "grade-bands", path: "/grade-bands",
    columns: [col("grade_letter", "Grade"), col("min_percentage", "Min %"), col("max_percentage", "Max %")],
    schema: gradeBandSchema,
    fields: [
      { name: "grade_letter", label: "Grade letter" },
      { name: "min_percentage", label: "Min %", type: "number" },
      { name: "max_percentage", label: "Max %", type: "number" },
    ],
    defaults: { grade_letter: "", min_percentage: 0, max_percentage: 100 },
    rowLabel: (r) => r.grade_letter,
    roles: { create: ADMINS, update: NONE, delete: NONE }, // API: GET/POST only
  }
  return <CrudPage cfg={cfg} />
}

// -- Personal traits ---------------------------------------------------------------------
interface Named { id: string; name: string }
const nameSchema = z.object({ name: req("Name is required").max(200) })
export function PersonalTraitsTab() {
  const cfg: CrudConfig<Named, z.infer<typeof nameSchema>> = {
    noun: "personal trait", title: "Personal traits", queryKey: "personal-traits", path: "/personal-traits",
    columns: [col("name", "Name")], schema: nameSchema, fields: [{ name: "name", label: "Name" }],
    defaults: { name: "" }, rowLabel: (r) => r.name,
    roles: { create: ADMINS, update: ADMINS, delete: ADMINS },
  }
  return <CrudPage cfg={cfg} />
}

// -- Developmental indicators (/cca-di) --------------------------------------------------
interface Di { id: string; branch_id: string; text: string; grade: string; sort_order: number }
const diSchema = z.object({ branch_id: req("Branch is required"), text: req("Text is required"), grade: req("Grade is required"), sort_order: seq })
export function DevelopmentalIndicatorsTab() {
  const branches = useBranchOptions()
  const name = labeler(branches.options)
  const cfg: CrudConfig<Di, z.infer<typeof diSchema>> = {
    noun: "indicator", title: "Developmental indicators", queryKey: "cca-di", path: "/cca-di",
    columns: [
      { accessorKey: "branch_id", header: "Branch", cell: ({ row }) => name(row.original.branch_id) },
      col("grade", "Grade"), col("text", "Indicator"), col("sort_order", "Order"),
    ],
    schema: diSchema,
    fields: [
      { name: "branch_id", label: "Branch", type: "select", options: branches.options },
      { name: "grade", label: "Grade (as text, e.g. 1)" },
      { name: "text", label: "Indicator", type: "textarea" },
      { name: "sort_order", label: "Order", type: "number" },
    ],
    defaults: { branch_id: "", text: "", grade: "", sort_order: 0 },
    rowLabel: (r) => r.text.slice(0, 40),
    roles: { create: ADMINS, update: ADMINS, delete: ADMINS },
  }
  return <CrudPage cfg={cfg} />
}

// -- CCA heads (grade-wise) and head activities --------------------------------------------
interface Head { id: string; grade_id: string; name: string; sequence: number }
const headSchema = z.object({ grade_id: req("Grade is required"), name: req("Name is required"), sequence: seq })
export function CcaHeadsTab() {
  const grades = useGradeOptions()
  const gname = labeler(grades.options)
  const cfg: CrudConfig<Head, z.infer<typeof headSchema>> = {
    noun: "CCA head", title: "CCA heads", queryKey: "cca-heads", path: "/cca-heads",
    columns: [
      { accessorKey: "grade_id", header: "Grade", cell: ({ row }) => gname(row.original.grade_id) },
      col("name", "Head"), col("sequence", "Order"),
    ],
    schema: headSchema,
    fields: [
      { name: "grade_id", label: "Grade", type: "select", options: grades.options },
      { name: "name", label: "Name" },
      { name: "sequence", label: "Order", type: "number" },
    ],
    defaults: { grade_id: "", name: "", sequence: 0 },
    rowLabel: (r) => r.name,
    roles: { create: ADMINS, update: ADMINS, delete: ADMINS },
  }
  return <CrudPage cfg={cfg} />
}

interface HeadActivity { id: string; head_id: string; name: string; sequence: number }
const headActSchema = z.object({ head_id: req("Head is required"), name: req("Name is required"), sequence: seq })
export function CcaHeadActivitiesTab() {
  const grades = useGradeOptions()
  const [gradeId, setGradeId] = useState("")
  const [headId, setHeadId] = useState("")
  const heads = useHeadOptions(gradeId)
  const cfg: CrudConfig<HeadActivity, z.infer<typeof headActSchema>> = {
    noun: "head activity", title: "Head activities", queryKey: `cca-head-activities-${headId}`, path: "/cca-head-activities",
    query: { head_id: headId },
    columns: [col("name", "Activity"), col("sequence", "Order")],
    schema: headActSchema,
    fields: [{ name: "name", label: "Name" }, { name: "sequence", label: "Order", type: "number" }],
    defaults: { head_id: headId, name: "", sequence: 0 },
    rowLabel: (r) => r.name,
    roles: { create: ADMINS, update: ADMINS, delete: ADMINS },
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Pick label="Grade" value={gradeId} onChange={(v) => { setGradeId(v); setHeadId("") }} options={grades.options} loading={grades.isPending} />
        <Pick label="CCA head" value={headId} onChange={setHeadId} options={heads.options} loading={!!gradeId && heads.isPending} />
      </div>
      {headId ? <CrudPage key={headId} cfg={cfg} /> : <p className="text-sm text-muted-foreground">Choose a grade and a head to manage its activities.</p>}
    </div>
  )
}

function useHeadOptions(gradeId: string) {
  const q = useQuery({
    queryKey: qk("exam-records", "heads", gradeId),
    enabled: !!gradeId,
    queryFn: async () => (await apiClient.get<Head[]>("/cca-heads", { params: { grade_id: gradeId, limit: 100 } })).data,
  })
  return { isPending: q.isPending, options: q.data?.map((h) => ({ value: h.id, label: h.name })) }
}

// -- Standard (class) teachers: assign / remove only -----------------------------------------
interface StdTeacher { id: string; grade_id: string; grade_name: string; staff_id: string; staff_name: string }
const stdSchema = z.object({ grade_id: req("Grade is required"), staff_id: req("Teacher is required") })
export function StandardTeachersTab() {
  const grades = useGradeOptions()
  const staff = useStaffOptions()
  const cfg: CrudConfig<StdTeacher, z.infer<typeof stdSchema>> = {
    noun: "standard teacher", title: "Standard teachers", queryKey: "standard-teachers", path: "/standard-teachers",
    columns: [col("grade_name", "Grade"), col("staff_name", "Teacher")],
    schema: stdSchema,
    fields: [
      { name: "grade_id", label: "Grade", type: "select", options: grades.options },
      { name: "staff_id", label: "Teacher", type: "select", options: staff.options },
    ],
    defaults: { grade_id: "", staff_id: "" },
    rowLabel: (r) => `${r.staff_name} (${r.grade_name})`,
    roles: { create: ADMINS, update: NONE, delete: ADMINS },
  }
  return <CrudPage cfg={cfg} />
}

// -- Remark templates -----------------------------------------------------------------------
interface StudentTpl { id: string; term: string; remark: string; sort_order: number }
const stpl = z.object({ term: req("Term is required").max(50), remark: req("Remark is required"), sort_order: seq })
export function StudentRemarkTemplatesTab() {
  const cfg: CrudConfig<StudentTpl, z.infer<typeof stpl>> = {
    noun: "remark template", title: "Student remark templates", queryKey: "student-remark-templates", path: "/student-remark-templates",
    columns: [col("term", "Term"), col("remark", "Remark"), col("sort_order", "Order")],
    schema: stpl,
    fields: [{ name: "term", label: "Term" }, { name: "remark", label: "Remark", type: "textarea" }, { name: "sort_order", label: "Order", type: "number" }],
    defaults: { term: "Term 1", remark: "", sort_order: 0 },
    rowLabel: (r) => r.remark.slice(0, 40),
    roles: undefined, // teachers may manage these too (backend: admin + teacher)
  }
  return <CrudPage cfg={cfg} />
}

interface CrTpl { id: string; grade_id: string; subject_id: string; remark: string; sort_order: number }
const ctpl = z.object({ grade_id: req("Grade is required"), subject_id: req("Subject is required"), remark: req("Remark is required"), sort_order: seq })
export function CrRemarkTemplatesTab() {
  const grades = useGradeOptions()
  const subjects = useSubjectOptions()
  const [gradeId, setGradeId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const cfg: CrudConfig<CrTpl, z.infer<typeof ctpl>> = {
    noun: "CR remark template", title: "Class-record remark templates", queryKey: `cr-remark-templates-${gradeId}-${subjectId}`, path: "/cr-remark-templates",
    query: { grade_id: gradeId, subject_id: subjectId },
    columns: [col("remark", "Remark"), col("sort_order", "Order")],
    schema: ctpl,
    fields: [{ name: "remark", label: "Remark", type: "textarea" }, { name: "sort_order", label: "Order", type: "number" }],
    defaults: { grade_id: gradeId, subject_id: subjectId, remark: "", sort_order: 0 },
    rowLabel: (r) => r.remark.slice(0, 40),
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Pick label="Grade" value={gradeId} onChange={setGradeId} options={grades.options} loading={grades.isPending} />
        <Pick label="Subject" value={subjectId} onChange={setSubjectId} options={subjects.options} loading={subjects.isPending} />
      </div>
      {gradeId && subjectId ? <CrudPage key={`${gradeId}${subjectId}`} cfg={cfg} /> : <p className="text-sm text-muted-foreground">Choose a grade and subject to see its remark templates.</p>}
    </div>
  )
}
