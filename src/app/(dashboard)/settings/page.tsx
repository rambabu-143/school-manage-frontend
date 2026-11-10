"use client"

import Link from "next/link"

import { useSession } from "@/hooks/use-session"
import { canAccessPath } from "@/lib/role-guard"

const LINKS = [
  ["/settings/profile", "Profile", "Your account, password and two-step sign-in"],
  ["/settings/security", "Security", "Two-step sign-in and sessions"],
  ["/settings/notifications", "Notifications", "Your notifications inbox"],
  ["/settings/school", "School", "Rename your school (school admin)"],
  ["/settings/app", "App settings", "Email/app/SMS switches and app versions"],
  ["/settings/calendar", "Calendar settings", "Open/close windows per module"],
  ["/settings/ar", "AR settings", "Appraisal review go-live windows"],
  ["/settings/module-access", "Module access", "Access groups by module"],
  ["/module-settings", "Module settings", "Turn feature areas on or off"],
  ["/master-data", "Master data", "Cities, banks, qualifications and other lookups"],
] as const

export default function SettingsHub() {
  const { data: user } = useSession()
  const links = LINKS.filter(([href]) => !!user && canAccessPath(user.role, href))
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-muted-foreground">Admin-only pages are rejected by the server for other roles.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {links.map(([href, title, desc]) => (
          <li key={href}>
            <Link href={href} className="block rounded-lg border p-4 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
