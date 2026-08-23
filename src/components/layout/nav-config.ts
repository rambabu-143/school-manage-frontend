import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Receipt,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react"

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

// Fees endpoints reject teachers outright, so the nav item follows the
// backend's FEES_ROLES rather than the broader STAFF_ROLES.
const FEES_ROLES: readonly Role[] = ["super_admin", "school_admin", "branch_admin", "accountant"]

// Admissions endpoints are admin-only (require_role(*ADMIN_ROLES) throughout).
const ADMIN_ONLY_ROLES: readonly Role[] = ["super_admin", "school_admin", "branch_admin"]

// Grows one entry per module as each is built - no placeholder links to
// pages that don't exist yet.
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Admissions", href: "/admissions", icon: ClipboardList, roles: ADMIN_ONLY_ROLES },
  { label: "Branches", href: "/branches", icon: Building2, roles: STAFF_ROLES },
  { label: "Students", href: "/students", icon: Users, roles: STAFF_ROLES },
  { label: "Staff", href: "/staff", icon: UsersRound, roles: STAFF_ROLES },
  { label: "Academics", href: "/academics", icon: BookOpen, roles: STAFF_ROLES },
  { label: "Attendance", href: "/attendance", icon: CalendarCheck, roles: STAFF_ROLES },
  { label: "Gradebook", href: "/gradebook", icon: GraduationCap, roles: STAFF_ROLES },
  { label: "Fees", href: "/fees", icon: Receipt, roles: FEES_ROLES },
  { label: "My Children", href: "/portal", icon: UserCheck, roles: ["parent"] },
]
