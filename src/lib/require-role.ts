import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { backendFetchWithToken } from "@/lib/backend"
import { ACCESS_TOKEN_COOKIE } from "@/lib/session-cookies"
import { NAV_ITEMS } from "@/components/layout/nav-config"
import { canAccess } from "@/lib/role-guard"
import type { Role, User } from "@/types/auth"

/**
 * Server-side role check for a page or layout: `await requireRole(["school_admin"])`.
 * Redirects to /forbidden when the signed-in role is not allowed. Server
 * Components cannot set cookies, so this never refreshes: with no usable
 * access token it returns null and the client layout (which can refresh)
 * plus the backend remain the enforcement. The backend is the real gate.
 */
export async function requireRole(allowed?: readonly Role[]): Promise<User | null> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return null
  let user: User
  try {
    const response = await backendFetchWithToken("/auth/me", token)
    if (!response.ok) return null
    user = (await response.json()) as User
  } catch {
    return null
  }
  if (!canAccess(user.role, allowed)) redirect("/forbidden")
  return user
}

/** Server guard for a top-level section, with roles taken from nav-config. */
export async function requireSectionRole(href: string) {
  return requireRole(NAV_ITEMS.find((i) => i.href === href)?.roles)
}
