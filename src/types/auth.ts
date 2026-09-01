export const ROLES = {
  SUPER_ADMIN: "super_admin",
  SCHOOL_ADMIN: "school_admin",
  BRANCH_ADMIN: "branch_admin",
  TEACHER: "teacher",
  ACCOUNTANT: "accountant",
  STUDENT: "student",
  PARENT: "parent",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ADMIN_ROLES: readonly Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.SCHOOL_ADMIN,
  ROLES.BRANCH_ADMIN,
]

export interface User {
  id: string
  email: string
  tenant_id: string
  role: Role
  is_active: boolean
}

export interface LoginInput {
  email: string
  password: string
}

// super_admin is seeded manually, not assignable via the API.
export const ASSIGNABLE_ROLES: readonly Role[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.BRANCH_ADMIN,
  ROLES.TEACHER,
  ROLES.ACCOUNTANT,
  ROLES.STUDENT,
  ROLES.PARENT,
]

export interface UserCreateInput {
  email: string
  password: string
  role: Role
}
