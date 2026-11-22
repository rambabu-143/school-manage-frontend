import { ADMIN_ROLES, ROLES } from "../types/auth"

// Pure helpers for notices, notice groups and the SMS inbox (unit-tested in tests/comms.test.mjs).

type Staffish = { id: string; user_id: string | null }

/** Branch-restricted users must send a branch the session can access: explicit pick, else the session branch. */
export function resolveBranch(picked?: string | null, sessionBranch?: string | null): string | undefined {
  return picked || sessionBranch || undefined
}

/** Notice search body: drops empty filters, rejects an inverted date window (backend 422s it too). */
export function noticeSearchBody(f: { branch_id?: string; audience?: string; start_date?: string; end_date?: string }) {
  const body: Record<string, string> = {}
  for (const [k, v] of Object.entries(f)) if (v && v !== "all-audiences") body[k] = v
  if (body.start_date && body.end_date && body.end_date < body.start_date) {
    return { body, error: "End date must not be before start date" }
  }
  return { body, error: undefined as string | undefined }
}

/** Edit payload: empty optional text clears the field (null), since PUT only changes keys that are sent. */
export function noticeUpdateBody<A extends string>(v: {
  title: string; body: string; audience: A; start_date: string; end_date: string; color_code?: string; location?: string
}) {
  return { ...v, color_code: v.color_code || null, location: v.location || null }
}

export function groupCreateBody(
  v: { name: string; student_ids: string[]; staff_ids: string[] },
  branchId?: string | null,
) {
  const body: { name: string; student_ids: string[]; staff_ids: string[]; branch_id?: string } = {
    name: v.name.trim(), student_ids: v.student_ids, staff_ids: v.staff_ids,
  }
  if (branchId) body.branch_id = branchId
  return body
}

/** The session user's own staff record (staff.user_id), so the topbar can ask for its inbox. */
export function ownStaffId(staff: Staffish[] | undefined, userId: string | undefined): string | undefined {
  return userId ? staff?.find((s) => s.user_id === userId)?.id : undefined
}

// Backend notices GROUP_ROLES (read and write).
export const GROUP_ROLES: readonly string[] = [...ADMIN_ROLES, ROLES.TEACHER]

// Backend SENDER_ROLES: only these may read a person's SMS inbox / unread count.
export const SMS_SENDER_ROLES: readonly string[] = [...ADMIN_ROLES, ROLES.TEACHER, ROLES.ACCOUNTANT]

export function smsReadPath(kind: "student" | "staff", messageId: string, personId: string) {
  return `/sms/read/${kind}/SMS/${messageId}/${personId}`
}

export function unreadLabel(n: number | undefined) {
  if (!n || n < 1) return ""
  return n > 9 ? "9+" : String(n)
}

/** Datesheet edit body: only changed fields (PUT is partial); times compared as HH:MM. Rejects end <= start. */
export function datesheetChanges(
  orig: { subject_id: string; exam_date: string; start_time: string; end_time: string },
  next: { subject_id: string; exam_date: string; start_time: string; end_time: string },
) {
  const hm = (t: string) => t.slice(0, 5)
  if (hm(next.end_time) <= hm(next.start_time)) return { error: "End time must be after start time" as string | undefined, body: {} }
  const body: Record<string, string> = {}
  if (next.subject_id !== orig.subject_id) body.subject_id = next.subject_id
  if (next.exam_date !== orig.exam_date) body.exam_date = next.exam_date
  if (hm(next.start_time) !== hm(orig.start_time)) body.start_time = hm(next.start_time)
  if (hm(next.end_time) !== hm(orig.end_time)) body.end_time = hm(next.end_time)
  return { error: undefined as string | undefined, body }
}
