import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  Building2,
  Bus,
  CircleDot,
  Combine,
  Images,
  CalendarCheck,
  CalendarOff,
  PartyPopper,
  ClipboardList,
  Flag,
  GraduationCap,
  HeartHandshake,
  Hotel,
  LayoutDashboard,
  Library,
  ToggleLeft,
  Music,
  Mail,
  IdCard,
  CalendarDays,
  ListChecks,
  Megaphone,
  MessageSquareText,
  NotebookText,
  Newspaper,
  Package,
  DoorOpen,
  FileText,
  FileBadge,
  BookMarked,
  Receipt,
  ShieldAlert,
  Smile,
  Sparkles,
  SplitSquareVertical,
  Vote,
  Clock,
  UserCheck,
  UserCog,
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

// Fees and hostel endpoints reject teachers outright, so these nav items
// follow this narrower role set rather than the broader STAFF_ROLES.
const ADMIN_AND_ACCOUNTANT_ROLES: readonly Role[] = [
  "super_admin",
  "school_admin",
  "branch_admin",
  "accountant",
]

// Admissions endpoints are admin-only (require_role(*ADMIN_ROLES) throughout).
const ADMIN_ONLY_ROLES: readonly Role[] = ["super_admin", "school_admin", "branch_admin"]

// Disciplinary records are readable by admins and teachers only (no accountant).
const ADMIN_AND_TEACHER_ROLES: readonly Role[] = [
  "super_admin",
  "school_admin",
  "branch_admin",
  "teacher",
]

// Grows one entry per module as each is built - no placeholder links to
// pages that don't exist yet.
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Notices", href: "/notices", icon: Megaphone },
  { label: "Communications", href: "/communications", icon: Mail, roles: STAFF_ROLES },
  { label: "Newsletters", href: "/newsletters", icon: Newspaper },
  { label: "Holidays", href: "/holidays", icon: CalendarDays },
  { label: "Admissions", href: "/admissions", icon: ClipboardList, roles: ADMIN_ONLY_ROLES },
  { label: "Branches", href: "/branches", icon: Building2, roles: STAFF_ROLES },
  { label: "Users", href: "/users", icon: UserCog, roles: ADMIN_ONLY_ROLES },
  { label: "Students", href: "/students", icon: Users, roles: STAFF_ROLES },
  { label: "Staff", href: "/staff", icon: UsersRound, roles: STAFF_ROLES },
  { label: "Academics", href: "/academics", icon: BookOpen, roles: STAFF_ROLES },
  { label: "Timetable", href: "/timetable", icon: Clock, roles: STAFF_ROLES },
  { label: "Attendance", href: "/attendance", icon: CalendarCheck, roles: STAFF_ROLES },
  { label: "Leave", href: "/hr", icon: CalendarOff, roles: STAFF_ROLES },
  { label: "Gradebook", href: "/gradebook", icon: GraduationCap, roles: STAFF_ROLES },
  {
    label: "Homework",
    href: "/homework",
    icon: BookMarked,
    roles: ADMIN_AND_TEACHER_ROLES,
  },
  { label: "Fees", href: "/fees", icon: Receipt, roles: ADMIN_AND_ACCOUNTANT_ROLES },
  { label: "ID Cards", href: "/id-cards", icon: IdCard, roles: ADMIN_AND_ACCOUNTANT_ROLES },
  {
    label: "Certificates",
    href: "/certificates",
    icon: FileBadge,
    roles: ADMIN_AND_ACCOUNTANT_ROLES,
  },
  { label: "Transport", href: "/transport", icon: Bus, roles: STAFF_ROLES },
  { label: "Hostel", href: "/hostel", icon: Hotel, roles: ADMIN_AND_ACCOUNTANT_ROLES },
  { label: "Inventory", href: "/inventory", icon: Package, roles: STAFF_ROLES },
  { label: "Rooms", href: "/rooms", icon: DoorOpen, roles: STAFF_ROLES },
  {
    label: "Disciplinary",
    href: "/disciplinary",
    icon: ShieldAlert,
    roles: ADMIN_AND_TEACHER_ROLES,
  },
  {
    label: "Observations",
    href: "/observations",
    icon: MessageSquareText,
    roles: ADMIN_AND_TEACHER_ROLES,
  },
  {
    label: "Counselling",
    href: "/counselling",
    icon: HeartHandshake,
    roles: ADMIN_AND_TEACHER_ROLES,
  },
  { label: "Alumni", href: "/alumni", icon: Sparkles, roles: ADMIN_ONLY_ROLES },
  {
    label: "Streams",
    href: "/streams",
    icon: SplitSquareVertical,
    roles: ADMIN_AND_TEACHER_ROLES,
  },
  { label: "Syllabus", href: "/syllabus", icon: ListChecks, roles: ADMIN_AND_TEACHER_ROLES },
  { label: "Appraisal", href: "/appraisal", icon: NotebookText, roles: STAFF_ROLES },
  { label: "Houses", href: "/houses", icon: Flag, roles: ADMIN_AND_TEACHER_ROLES },
  { label: "Elective Combos", href: "/combo", icon: Combine, roles: ADMIN_AND_TEACHER_ROLES },
  { label: "Gallery", href: "/gallery", icon: Images, roles: ADMIN_AND_TEACHER_ROLES },
  { label: "Clubs", href: "/clubs", icon: CircleDot, roles: ADMIN_AND_TEACHER_ROLES },
  { label: "CCA Grading", href: "/cca", icon: Music, roles: ADMIN_AND_TEACHER_ROLES },
  {
    label: "Self-Nomination",
    href: "/self-nomination",
    icon: Vote,
    roles: ADMIN_AND_TEACHER_ROLES,
  },
  { label: "Events", href: "/events", icon: PartyPopper, roles: ADMIN_AND_TEACHER_ROLES },
  { label: "Documents", href: "/documents", icon: FileText, roles: ADMIN_AND_TEACHER_ROLES },
  {
    label: "Self-Awareness",
    href: "/self-awareness",
    icon: Smile,
    roles: ADMIN_AND_TEACHER_ROLES,
  },
  { label: "My Children", href: "/portal", icon: UserCheck, roles: ["parent"] },
  { label: "Master Data", href: "/master-data", icon: Library, roles: ADMIN_ONLY_ROLES },
  { label: "Module Settings", href: "/module-settings", icon: ToggleLeft, roles: ADMIN_ONLY_ROLES },
]
