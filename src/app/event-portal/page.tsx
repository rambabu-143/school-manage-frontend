"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// Event users are a separate identity from staff: plain fetch to /api/event-portal/*
// (httpOnly cookie set by the BFF), never the staff api client or session.
type EventUser = { name: string; code: string; email: string; type: string; final_submit: boolean; submitted_at: string | null; confirmation_sent_at: string | null }
const KEY = ["event-portal", "me"] as const

async function call<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(`/api/event-portal/${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw Object.assign(new Error(data?.error ?? "Something went wrong"), { status: res.status })
  return data as T
}

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [tenant, setTenant] = useState("")
  const login = useMutation({
    mutationFn: () => call("login", "POST", { email, password, ...(tenant ? { tenant_id: tenant } : {}) }),
    onSuccess: onDone,
  })
  return (
    <Card className="mx-auto mt-16 w-full max-w-sm">
      <CardHeader><CardTitle>Event portal</CardTitle><CardDescription>Sign in with your event account.</CardDescription></CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); login.mutate() }}>
          <label className="block space-y-1 text-sm font-medium">Email<Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block space-y-1 text-sm font-medium">Password<Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <label className="block space-y-1 text-sm font-medium">School id (optional)<Input value={tenant} onChange={(e) => setTenant(e.target.value)} /></label>
          {login.isError && <p role="alert" className="text-sm text-destructive">{login.error.message}</p>}
          <Button type="submit" className="w-full" disabled={login.isPending}>{login.isPending ? "Signing in..." : "Sign in"}</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function EventPortalPage() {
  const qc = useQueryClient()
  const me = useQuery({ queryKey: KEY, queryFn: () => call<EventUser>("me"), retry: false })
  const set = (u: EventUser) => qc.setQueryData(KEY, u)
  const [confirming, setConfirming] = useState(false)
  const submit = useMutation({ mutationFn: () => call<EventUser>("final-submit", "PUT", { final_submit: true }), onSuccess: (u) => { set(u); setConfirming(false) }, onError: () => setConfirming(false) })
  const mail = useMutation({ mutationFn: () => call<EventUser>("final-submit/send-mail", "POST"), onSuccess: set })
  const logout = useMutation({ mutationFn: () => call("logout", "POST"), onSettled: () => qc.removeQueries({ queryKey: KEY }) })

  if (me.isPending) return <p className="p-8 text-sm text-muted-foreground" role="status">Loading...</p>
  const unauth = (me.error as { status?: number } | null)?.status === 401
  if (unauth || !me.data) {
    if (me.isError && !unauth) {
      return <div role="alert" className="m-8 space-y-2 text-sm text-destructive"><p>{me.error.message}</p><Button variant="outline" onClick={() => me.refetch()}>Retry</Button></div>
    }
    return <Login onDone={() => me.refetch()} />
  }
  const u = me.data
  const err = submit.error ?? mail.error
  return (
    <main className="mx-auto max-w-xl space-y-4 p-4 sm:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Welcome, {u.name}</h1>
        <Button variant="outline" size="sm" onClick={() => logout.mutate()}>Sign out</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Your account</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Code: {u.code}</p><p>Email: {u.email}</p><p>Type: {u.type}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Final submission</CardTitle>
          <CardDescription>{u.final_submit ? `Submitted${u.submitted_at ? ` on ${new Date(u.submitted_at).toLocaleString()}` : ""}.` : "Not submitted yet."}</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {err && <p role="alert" className="text-sm text-destructive">{err.message}</p>}
          <div className="flex flex-wrap gap-2">
            {!u.final_submit && <Button disabled={submit.isPending} onClick={() => setConfirming(true)}>Submit final</Button>}
            {u.final_submit && <Button variant="outline" disabled={mail.isPending} onClick={() => mail.mutate()}>{u.confirmation_sent_at ? "Resend confirmation email" : "Send confirmation email"}</Button>}
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog open={confirming} onOpenChange={setConfirming} isPending={submit.isPending} confirmLabel="Submit final"
        title="Submit final?" description="Your final submission cannot be withdrawn or changed afterwards." onConfirm={() => submit.mutate()} />
    </main>
  )
}
