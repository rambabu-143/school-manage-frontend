"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Skeleton } from "@/components/ui/skeleton"
import { ImpersonationBanner } from "@/components/auth/impersonation-banner"
import { StatusScreen } from "@/components/auth/status-screen"
import { canAccessPath } from "@/lib/role-guard"
import { useSession } from "@/hooks/use-session"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: user, isPending, isError, refetch } = useSession()

  // Only a clean 401 (user === null) means "not authenticated" - redirect to
  // login. A network/5xx error (isError) is transient: the session cookie is
  // still there, so bouncing to /login would just have proxy.ts bounce back
  // to /dashboard on the cookie's presence, looping forever. Show a retry
  // state instead.
  React.useEffect(() => {
    if (!isPending && user === null) {
      router.replace("/login")
    }
  }, [isPending, user, router])

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">Couldn&apos;t reach the server. Check your connection and try again.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  if (isPending || !user) {
    return (
      <div className="flex h-screen flex-col gap-4 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-full w-full flex-1" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ImpersonationBanner user={user} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {canAccessPath(user.role, pathname) ? children : (
                <StatusScreen title="You don&apos;t have access to this page">Your role doesn&apos;t include this area. Ask a school admin if you think that&apos;s a mistake.</StatusScreen>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      </div>
    </div>
  )
}
