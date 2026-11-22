"use client"

import * as React from "react"

import { SectionSelect } from "@/components/section-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSectionDashboard, useStaffAnalytics, useSuperAdminDashboard } from "@/hooks/use-dashboard"
import { useSession } from "@/hooks/use-session"
import { useStaff } from "@/hooks/use-staff"
import { defaultRange, presentPct, validRange } from "@/lib/insights"
import type { SectionBreakdown, TodayStudentAttendance } from "@/types/dashboard"

const Msg = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

function Attendance({ a }: { a: TodayStudentAttendance }) {
  return <Stat label="Students present today" value={`${a.total_present} / ${a.marked} (${presentPct(a.total_present, a.marked)}%)`} />
}

function Sections({ rows }: { rows: SectionBreakdown[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Sections</CardTitle></CardHeader>
      <CardContent>
        {rows.length === 0 ? <Msg>No sections.</Msg> : (
          <ul className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((s) => (
              <li key={s.section_id} className="flex justify-between">
                <span>{s.grade} {s.section}</span>
                <span className="text-muted-foreground">{s.total_students} ({s.total_boys}B / {s.total_girls}G)</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function Loading({ pending, error, noStaff }: { pending: boolean; error: boolean; noStaff?: boolean }) {
  if (noStaff) return <Msg>Your account has no staff record, so this view is unavailable.</Msg>
  if (pending) return <Skeleton className="h-24" />
  if (error) return <Msg>Could not load this view.</Msg>
  return null
}

type Range = { start: string; end: string }

function Network({ staffId, range }: { staffId?: string; range: Range }) {
  const q = useSuperAdminDashboard(staffId, range, true)
  const gate = <Loading pending={q.isPending} error={q.isError} noStaff={!staffId} />
  if (!q.data) return gate
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4"><Stat label="Students" value={q.data.total_students} /><Stat label="Staff" value={q.data.total_staff} /></div>
      {q.data.branches.map((b) => (
        <Card key={b.branch_id}>
          <CardHeader><CardTitle className="text-base">{b.branch_name} ({b.branch_code})</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Students" value={b.total_students} />
            <Stat label="Staff" value={b.total_staff} />
            <Attendance a={b.student_attendance_today} />
            <Stat label="Pending leave" value={b.pending_leave_applications} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function Mine({ staffId, range }: { staffId?: string; range: Range }) {
  const q = useStaffAnalytics(staffId, range, true)
  if (!q.data) return <Loading pending={q.isPending} error={q.isError} noStaff={!staffId} />
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label="Students" value={q.data.total_students} />
        <Stat label="Staff" value={q.data.total_staff} />
        <Attendance a={q.data.student_attendance_today} />
      </div>
      <Sections rows={q.data.sections} />
      <Card>
        <CardHeader><CardTitle className="text-base">Recent notices</CardTitle></CardHeader>
        <CardContent>
          {q.data.recent_notices.length === 0 ? <Msg>No active notices.</Msg> : (
            <ul className="flex flex-col gap-2 text-sm">{q.data.recent_notices.map((n) => <li key={n.id} className="font-medium">{n.title}</li>)}</ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Roster({ range }: { range: Range }) {
  const [sectionId, setSectionId] = React.useState<string>()
  const q = useSectionDashboard(sectionId, range, true)
  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-sm"><SectionSelect value={sectionId} onChange={setSectionId} /></div>
      {!sectionId && <Msg>Pick a section to see its attendance roster.</Msg>}
      {sectionId && !q.data && <Loading pending={q.isPending} error={q.isError} />}
      {q.data && (
        <Card>
          <CardHeader><CardTitle className="text-base">{q.data.total_students} students</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground"><th>Adm. no.</th><th>Name</th><th>Today</th><th>P</th><th>A</th><th>L</th></tr></thead>
              <tbody>
                {q.data.students.map((s) => (
                  <tr key={s.student_id}>
                    <td>{s.admission_number}</td><td>{s.first_name} {s.last_name}</td>
                    <td>{s.today_status ?? "-"}</td><td>{s.attendance.present}</td><td>{s.attendance.absent}</td><td>{s.attendance.late}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function InsightsPage() {
  const { data: user } = useSession()
  const staff = useStaff()
  const [range, setRange] = React.useState(() => defaultRange(new Date()))
  const me = staff.data?.find((s) => s.user_id === user?.id)
  const ok = validRange(range.start, range.end)
  const network = user?.role === "super_admin" || user?.role === "school_admin"
  if (!user) return null
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Insights</h1>
        <p className="text-sm text-muted-foreground">Read-only role dashboards.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input type="date" className="w-40" value={range.start} onChange={(e) => setRange({ ...range, start: e.target.value })} />
        <span className="text-sm text-muted-foreground">to</span>
        <Input type="date" className="w-40" value={range.end} onChange={(e) => setRange({ ...range, end: e.target.value })} />
      </div>
      {!ok ? <Msg>Pick a valid date range (start on or before end).</Msg> : (
        <Tabs defaultValue={network ? "network" : "mine"}>
          <TabsList>
            {network && <TabsTrigger value="network">All branches</TabsTrigger>}
            <TabsTrigger value="mine">My analytics</TabsTrigger>
            <TabsTrigger value="roster">Section roster</TabsTrigger>
          </TabsList>
          {network && <TabsContent value="network"><Network staffId={me?.id} range={range} /></TabsContent>}
          <TabsContent value="mine"><Mine staffId={me?.id} range={range} /></TabsContent>
          <TabsContent value="roster"><Roster range={range} /></TabsContent>
        </Tabs>
      )}
    </div>
  )
}
