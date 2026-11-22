"use client"

import Link from "next/link"
import { MessageSquare } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSmsUnreadCount } from "@/hooks/use-communications"
import { useStaff } from "@/hooks/use-staff"
import { SMS_SENDER_ROLES, ownStaffId, unreadLabel } from "@/lib/comms"
import type { User } from "@/types/auth"

/** Unread SMS for the signed-in staff member's own inbox; hidden when the user has no staff record. */
export function SmsUnreadBell({ user }: { user: User }) {
  const allowed = SMS_SENDER_ROLES.includes(user.role)
  const { data: staff } = useStaff()
  const staffId = allowed ? ownStaffId(staff, user.id) : undefined
  const { data: count } = useSmsUnreadCount("staff", staffId)
  if (!staffId) return null
  const label = unreadLabel(count)

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href="/communications">
        <MessageSquare className="size-4" />
        {label && (
          <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">{label}</Badge>
        )}
        <span className="sr-only">{count ? `${count} unread SMS` : "SMS inbox"}</span>
      </Link>
    </Button>
  )
}
