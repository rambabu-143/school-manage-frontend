"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useMarkNotificationRead, useNotifications } from "@/hooks/use-notifications"

export default function NotificationsPage() {
  const { data, isPending, isError, refetch } = useNotifications()
  const mark = useMarkNotificationRead()
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      {isPending ? <Skeleton className="h-24" /> : isError ? (
        <p role="alert" className="text-sm text-destructive">Could not load notifications. <Button variant="link" onClick={() => refetch()}>Retry</Button></p>
      ) : data.length === 0 ? <p className="text-sm text-muted-foreground">You have no notifications.</p> : (
        <ul className="divide-y rounded-lg border">
          {data.map((n) => (
            <li key={n.id} className="flex items-start justify-between gap-3 p-3">
              <div>
                <p className={n.is_read ? "" : "font-semibold"}>{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
              </div>
              {!n.is_read && <Button size="sm" variant="outline" disabled={mark.isPending} onClick={() => mark.mutate(n.id)}>Mark read</Button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
