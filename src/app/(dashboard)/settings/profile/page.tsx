"use client"

import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/hooks/use-session"
import { formatRole } from "@/lib/format-role"

export default function ProfilePage() {
  const { data: user, isPending, isError } = useSession()
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      {isPending ? <Skeleton className="h-32" /> : isError || !user ? (
        <p role="alert" className="text-sm text-destructive">Could not load your profile.</p>
      ) : (
        <Card>
          <CardHeader><CardTitle>{user.email}</CardTitle><CardDescription>{formatRole(user.role)}</CardDescription></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <Link className="underline" href="/settings/security">Two-step sign-in and sessions</Link>
            </p>
            <p>
              Password: the backend has no change-password endpoint, only email reset.{" "}
              <Link className="underline" href="/forgot-password">Send a password reset link</Link>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
