"use client"

import * as React from "react"

import { StaffSelect } from "@/components/staff-select"
import { StudentSelect } from "@/components/student-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMarkSmsRead, useSmsInbox, useSmsUnreadCount } from "@/hooks/use-communications"
import type { SmsPersonKind } from "@/types/communications"

/** Read state of one person's SMS inbox (backend returns 404 for people outside the caller's branch). */
export function SmsInbox() {
  const [kind, setKind] = React.useState<SmsPersonKind>("staff")
  const [personId, setPersonId] = React.useState<string>()
  const inbox = useSmsInbox(kind, personId)
  const unread = useSmsUnreadCount(kind, personId)
  const mark = useMarkSmsRead(kind, personId)

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium">Inbox read state</h3>
        {personId && <Badge variant="secondary">{unread.data ?? 0} unread</Badge>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={kind} onValueChange={(v) => { setKind(v as SmsPersonKind); setPersonId(undefined) }}>
          <SelectTrigger className="w-32" aria-label="Person type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
        <div className="w-72">
          {kind === "staff" ? <StaffSelect value={personId} onChange={setPersonId} /> : <StudentSelect value={personId} onChange={setPersonId} />}
        </div>
      </div>
      {inbox.isError && <p className="text-sm text-destructive">Person not found or not in your branch.</p>}
      {inbox.data?.length === 0 && <p className="text-sm text-muted-foreground">No messages for this person.</p>}
      <ul className="flex flex-col gap-2">
        {inbox.data?.map((m) => {
          const read = m.read_flag === true
          return (
            <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
              <span className={read ? "text-muted-foreground" : "font-medium"}>{m.body}</span>
              <Button size="sm" variant="outline" disabled={mark.isPending}
                onClick={() => mark.mutate({ messageId: m.id, read: !read })}>
                Mark {read ? "unread" : "read"}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
