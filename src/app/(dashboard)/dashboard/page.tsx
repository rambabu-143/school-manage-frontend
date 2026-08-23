"use client"

import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "@/hooks/use-session"
import { formatRole } from "@/lib/format-role"

export default function DashboardPage() {
  const { data: user } = useSession()

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <Badge variant="secondary">{formatRole(user.role)}</Badge>
          </div>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You&apos;re signed in. Modules will appear in the sidebar as they&apos;re
            added.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
