import type { LucideIcon } from "lucide-react"
import { BookOpen, Building2, LayoutDashboard, Users, UsersRound } from "lucide-react"

import type { Role } from "@/types/auth"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Omit to show for every role. */
  roles?: readonly Role[]
}

const STAFF_ROLES: readonly Role[] = [
  "super_admin",
  "school_admin",
  "branch_admin",
  "teacher",
  "accountant",
]

// Grows one entry per module as each is built - no placeholder links to
// pages that don't exist yet.
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Branches", href: "/branches", icon: Building2, roles: STAFF_ROLES },
  { label: "Students", href: "/students", icon: Users, roles: STAFF_ROLES },
  { label: "Staff", href: "/staff", icon: UsersRound, roles: STAFF_ROLES },
  { label: "Academics", href: "/academics", icon: BookOpen, roles: STAFF_ROLES },
]
