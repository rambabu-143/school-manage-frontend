import { NAV_ITEMS } from "@/components/layout/nav-config"
import type { Role } from "@/types/auth"

// Mirrors src/auth/constants.py ROLE_RANK. Higher = more privileged.
export const ROLE_RANK: Record<Role, number> = {
  super_admin: 100,
  school_admin: 80,
  branch_admin: 60,
  teacher: 40,
  accountant: 40,
  student: 20,
  parent: 20,
}

export function canAccess(role: Role, allowed?: readonly Role[]): boolean {
  return !allowed || allowed.length === 0 || allowed.includes(role)
}

/** Roles that may impersonate: the backend's require_admin. */
export function canImpersonate(role: Role): boolean {
  return role === "super_admin" || role === "school_admin" || role === "branch_admin"
}

/** Users this role may switch to: strictly lower rank (backend enforces too). */
export function canImpersonateTarget(admin: Role, target: Role): boolean {
  return canImpersonate(admin) && (ROLE_RANK[target] ?? 1000) < ROLE_RANK[admin]
}

/** Allowed roles for a pathname, taken from the nav config (the one place
 * route roles are declared). Longest matching prefix wins. undefined = open. */
export function rolesForPath(pathname: string): readonly Role[] | undefined {
  const match = NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  ).sort((a, b) => b.href.length - a.href.length)[0]
  return match?.roles
}

// Dashboard areas that have no nav entry but every signed-in role may open.
const OPEN_PREFIXES = ["/settings", "/forbidden"]

/** Default-deny: a path is open only if its nav entry lists the role (or
 * lists none), or it is explicitly open. Unknown paths are admin-only. */
export function canAccessPath(role: Role, pathname: string): boolean {
  const known = NAV_ITEMS.some((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
  if (!known && OPEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true
  if (!known) return canImpersonate(role)
  return canAccess(role, rolesForPath(pathname))
}
