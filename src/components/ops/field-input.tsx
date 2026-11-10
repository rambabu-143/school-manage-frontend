"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AcademicYearSelect } from "@/components/academic-year-select"
import { BranchSelect } from "@/components/branch-select"
import { ClubSelect } from "@/components/club-select"
import { DepartmentSelect } from "@/components/department-select"
import { GradeSelect } from "@/components/grade-select"
import { HostelSelect } from "@/components/hostel-select"
import { HouseSelect } from "@/components/house-select"
import { ProductSelect } from "@/components/product-select"
import { RouteSelect } from "@/components/route-select"
import { SectionSelect } from "@/components/section-select"
import { StaffSelect } from "@/components/staff-select"
import { StopSelect } from "@/components/stop-select"
import { StreamSelect } from "@/components/stream-select"
import { StudentSelect } from "@/components/student-select"
import { UserSelect } from "@/components/user-select"
import type { Field, RefKind } from "@/lib/ops/types"

type Pick = (p: { value: string | undefined; onChange: (v: string) => void; routeId?: string }) => React.ReactNode

const PICKERS: Record<RefKind, Pick> = {
  branch: (p) => <BranchSelect {...p} />,
  year: (p) => <AcademicYearSelect {...p} />,
  grade: (p) => <GradeSelect {...p} />,
  section: (p) => <SectionSelect {...p} />,
  student: (p) => <StudentSelect {...p} />,
  route: (p) => <RouteSelect {...p} />,
  stop: (p) => <StopSelect routeId={p.routeId} value={p.value} onChange={p.onChange} />,
  product: (p) => <ProductSelect {...p} />,
  user: (p) => <UserSelect {...p} />,
  department: (p) => <DepartmentSelect {...p} />,
  club: (p) => <ClubSelect {...p} />,
  stream: (p) => <StreamSelect {...p} />,
  hostel: (p) => <HostelSelect {...p} />,
  house: (p) => <HouseSelect {...p} />,
  staff: (p) => <StaffSelect {...p} />,
}

export function RefPicker({ kind, ...p }: { kind: RefKind; value: string | undefined; onChange: (v: string) => void; routeId?: string }) {
  return <>{PICKERS[kind](p)}</>
}

const HTML_TYPE: Record<string, string> = { text: "text", number: "number", date: "date", time: "time", datetime: "datetime-local", password: "password", email: "email" }

/** One labelled control. `id` ties the label to the input for keyboard and screen-reader use. */
export function FieldInput({ field, value, onChange, error, all, idPrefix = "f" }: {
  field: Field
  value: unknown
  onChange: (v: unknown) => void
  error?: string
  all: Record<string, unknown>
  idPrefix?: string
}) {
  const kind = field.kind ?? "text"
  const id = `${idPrefix}-${field.name}`
  let control: React.ReactNode
  if (kind === "bool") {
    control = <Switch id={id} checked={Boolean(value)} onCheckedChange={onChange} />
  } else if (kind === "textarea" || kind === "lines") {
    control = <Textarea id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} rows={4} />
  } else if (kind === "select") {
    control = (
      <Select value={String(value ?? "") || undefined} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full"><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
        <SelectContent>{field.options?.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    )
  } else if (kind === "file") {
    control = <Input id={id} type="file" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
  } else if (kind === "multi") {
    const list = (Array.isArray(value) ? value : []) as string[]
    control = (
      <div className="space-y-2">
        <RefPicker kind={field.ref!} value={undefined} onChange={(v) => v && !list.includes(v) && onChange([...list, v])} />
        {list.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {list.map((v) => (
              <li key={v}>
                <Button type="button" size="sm" variant="secondary" aria-label={`Remove ${v}`} onClick={() => onChange(list.filter((x) => x !== v))}>
                  {v.slice(0, 8)} ×
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  } else if (kind in PICKERS) {
    control = <RefPicker kind={kind as RefKind} value={(value as string) || undefined} onChange={onChange} routeId={field.routeField ? (all[field.routeField] as string) : undefined} />
  } else {
    control = <Input id={id} type={HTML_TYPE[kind] ?? "text"} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} />
  }
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{field.label}{field.required && <span className="text-destructive"> *</span>}</label>
      {control}
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
