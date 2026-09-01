"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  CalendarClock,
  CalendarDays,
  GraduationCap,
  Megaphone,
  ReceiptText,
  UserCog,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import { useSession } from "@/hooks/use-session"
import { formatRole } from "@/lib/format-role"
import { ADMIN_ROLES } from "@/types/auth"

function formatCurrency(value: string): string {
  const amount = Number(value)
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-full bg-muted p-3">
          <Icon className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function AdminSummary() {
  const { data: summary, isPending } = useDashboardSummary()

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Students" value={summary.student_count} icon={Users} />
        <StatCard label="Staff" value={summary.staff_count} icon={UserCog} />
        <StatCard
          label="Collected this month"
          value={formatCurrency(summary.fees_collected_this_month)}
          icon={ReceiptText}
        />
        <StatCard
          label="Fees outstanding"
          value={formatCurrency(summary.fees_outstanding)}
          icon={ReceiptText}
        />
        <StatCard
          label="Pending leave requests"
          value={summary.pending_leave_applications}
          icon={GraduationCap}
        />
      </div>

      {summary.contract_expiring_staff.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="size-4" />
              Contracts expiring soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {summary.contract_expiring_staff.map((staff) => (
                <li key={staff.staff_id} className="flex items-center justify-between text-sm">
                  <span>
                    {staff.first_name} {staff.last_name}
                  </span>
                  <span className="text-muted-foreground">
                    {staff.days_remaining} day{staff.days_remaining === 1 ? "" : "s"} left
                    &middot; {format(new Date(staff.contract_end_date), "MMM d, yyyy")}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4" />
              Upcoming holidays
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.upcoming_holidays.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming holidays.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {summary.upcoming_holidays.map((holiday) => (
                  <li key={holiday.id} className="flex items-center justify-between text-sm">
                    <span>{holiday.title}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(holiday.holiday_date), "MMM d, yyyy")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="size-4" />
              Recent notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.recent_notices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active notices.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {summary.recent_notices.map((notice) => (
                  <li key={notice.id} className="text-sm">
                    <p className="font-medium">{notice.title}</p>
                    <p className="line-clamp-1 text-muted-foreground">{notice.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: user } = useSession()

  if (!user) return null

  const isAdmin = (ADMIN_ROLES as readonly string[]).includes(user.role)

  return (
    <div className="flex flex-col gap-6">
      <Card className={isAdmin ? undefined : "mx-auto max-w-3xl"}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <Badge variant="secondary">{formatRole(user.role)}</Badge>
          </div>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        {!isAdmin && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You&apos;re signed in. Modules will appear in the sidebar as they&apos;re added.
            </p>
          </CardContent>
        )}
      </Card>

      {isAdmin && <AdminSummary />}
    </div>
  )
}
