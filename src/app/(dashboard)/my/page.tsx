"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCreateLeaveApplication, useLeaveApplications } from "@/hooks/use-leave-applications"
import { useSession } from "@/hooks/use-session"
import { useStaff } from "@/hooks/use-staff"
import { useStaffAttendance } from "@/hooks/use-staff-attendance"
import { useTimetableEntries } from "@/hooks/use-timetable"
import { LEAVE_TYPES, type LeaveType } from "@/types/hr"

const Msg = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>

function Leave({ staffId }: { staffId: string }) {
  const { data, isPending, isError } = useLeaveApplications({ staffId })
  const create = useCreateLeaveApplication()
  const [type, setType] = useState<LeaveType>("casual")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [reason, setReason] = useState("")
  return (
    <div className="space-y-4">
      <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => {
        e.preventDefault()
        create.mutate({ staff_id: staffId, leave_type: type, start_date: from, end_date: to, reason: reason.trim() }, { onSuccess: () => setReason("") })
      }}>
        <div><label htmlFor="lv-t" className="text-sm font-medium">Type</label>
          <select id="lv-t" className="h-9 rounded-md border bg-background px-2 text-sm" value={type} onChange={(e) => setType(e.target.value as LeaveType)}>
            {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select></div>
        <div><label htmlFor="lv-f" className="text-sm font-medium">From</label><Input id="lv-f" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label htmlFor="lv-e" className="text-sm font-medium">To</label><Input id="lv-e" type="date" min={from} value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div><label htmlFor="lv-r" className="text-sm font-medium">Reason</label><Input id="lv-r" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        <Button type="submit" disabled={create.isPending || !from || !to || to < from || !reason.trim()}>Apply</Button>
      </form>
      {isPending ? <Skeleton className="h-20" /> : isError ? <p role="alert" className="text-sm text-destructive">Could not load leave.</p> : data.length === 0 ? <Msg>No leave applications.</Msg> : (
        <ul className="divide-y rounded-lg border">{data.map((l) => <li key={l.id} className="p-3 text-sm">{l.leave_type}: {l.start_date} to {l.end_date} - <b>{l.status}</b>{l.review_comment ? ` (${l.review_comment})` : ""}</li>)}</ul>
      )}
    </div>
  )
}

function Attendance({ staffId }: { staffId: string }) {
  const { data, isPending, isError } = useStaffAttendance({ staffId })
  if (isPending) return <Skeleton className="h-20" />
  if (isError) return <p role="alert" className="text-sm text-destructive">Could not load attendance.</p>
  if (!data.length) return <Msg>No attendance records.</Msg>
  return <ul className="divide-y rounded-lg border">{data.slice(0, 60).map((a) => <li key={a.id} className="p-3 text-sm">{a.date}: {a.status}{a.in_time ? ` (${a.in_time}${a.out_time ? `-${a.out_time}` : ""})` : ""}</li>)}</ul>
}

function Timetable({ staffId }: { staffId: string }) {
  const { data, isPending, isError } = useTimetableEntries({ staffId })
  if (isPending) return <Skeleton className="h-20" />
  if (isError) return <p role="alert" className="text-sm text-destructive">Could not load timetable.</p>
  if (!data.length) return <Msg>No timetable entries assigned.</Msg>
  return <ul className="divide-y rounded-lg border">{data.map((t) => <li key={t.id} className="p-3 text-sm capitalize">{t.day_of_week}: period {t.period_id.slice(0, 8)}</li>)}</ul>
}

export default function MyWorkspacePage() {
  const { data: user } = useSession()
  const staff = useStaff()
  const me = staff.data?.find((s) => s.user_id === user?.id)
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My workspace</h1>
      {staff.isPending ? <Skeleton className="h-24" /> : staff.isError ? (
        <p role="alert" className="text-sm text-destructive">Could not load your staff record.</p>
      ) : !me ? <Msg>No staff record is linked to your login. Ask an admin to link it.</Msg> : (
        <>
          <p className="text-sm">{me.first_name} {me.last_name} - {me.designation} ({me.employee_number})</p>
          <Tabs defaultValue="leave">
            <TabsList><TabsTrigger value="leave">Leave</TabsTrigger><TabsTrigger value="attendance">Attendance</TabsTrigger><TabsTrigger value="timetable">Timetable</TabsTrigger><TabsTrigger value="aar">AAR</TabsTrigger></TabsList>
            <TabsContent value="leave"><Leave staffId={me.id} /></TabsContent>
            <TabsContent value="attendance"><Attendance staffId={me.id} /></TabsContent>
            <TabsContent value="timetable"><Timetable staffId={me.id} /></TabsContent>
            <TabsContent value="aar"><Msg>Appraisal forms live under <Link className="underline" href="/appraisal">Appraisal</Link>. The staff-aar form API is not wired in this screen yet.</Msg></TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
