import type { Role } from "@/types/auth"

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  school_admin: "School Admin",
  branch_admin: "Branch Admin",
  teacher: "Teacher",
  accountant: "Accountant",
  student: "Student",
  parent: "Parent",
}

export function formatRole(role: Role): string {
  return ROLE_LABELS[role] ?? role
}
