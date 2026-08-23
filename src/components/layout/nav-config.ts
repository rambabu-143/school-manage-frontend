import type { LucideIcon } from "lucide-react"
import { LayoutDashboard } from "lucide-react"

import type { Role } from "@/types/auth"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Omit to show for every role. */
  roles?: readonly Role[]
}

// Grows one entry per module as each is built - no placeholder links to
// pages that don't exist yet.
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
]
