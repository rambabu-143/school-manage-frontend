"use client"

import * as React from "react"
import QRCode from "qrcode"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLogoutAll, useSessionScope, useTwoFactor } from "@/hooks/use-identity"
import { useSession } from "@/hooks/use-session"
import { canImpersonate } from "@/lib/role-guard"

function TwoFactorCard() {
  const { setup, enable, disable } = useTwoFactor()
  const [qr, setQr] = React.useState<string | null>(null)
  const [code, setCode] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [done, setDone] = React.useState<string[] | null>(null)
  const alreadyOn = setup.isError && /already/i.test(setup.error.message)
  const [off, setOff] = React.useState(false)

  const start = () => setup.mutate(undefined, { onSuccess: (d) => QRCode.toDataURL(d.provisioning_uri, { width: 192 }).then(setQr) })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-step sign-in</CardTitle>
        <CardDescription>Add a code from an authenticator app to protect your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {done ? (
          <div className="space-y-2">
            <p className="text-sm">Two-step sign-in is on. Save these backup codes somewhere safe. Each works once, and we won&apos;t show them again.</p>
            <ul className="grid grid-cols-2 gap-1 font-mono text-sm">{done.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
        ) : setup.data && qr ? (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); enable.mutate(code, { onSuccess: (d) => setDone(d.backup_codes) }) }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR code to scan with your authenticator app" width={192} height={192} />
            <p className="text-sm text-muted-foreground">Can&apos;t scan? Enter this key instead: <code className="break-all">{setup.data.secret}</code></p>
            <label htmlFor="tf-code" className="text-sm font-medium">6-digit code from the app</label>
            <Input id="tf-code" inputMode="numeric" autoComplete="one-time-code" maxLength={16} value={code} onChange={(e) => setCode(e.target.value)} />
            {enable.isError && <p role="alert" className="text-sm text-destructive">{enable.error.message}</p>}
            <Button type="submit" disabled={enable.isPending || !code.trim()}>Turn on</Button>
          </form>
        ) : (alreadyOn || off) ? (
          disable.isSuccess ? <p className="text-sm">Two-step sign-in is off. You may need to sign in again.</p> :
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); disable.mutate(password) }}>
            <p className="text-sm">Two-step sign-in is on. To turn it off, confirm your password.</p>
            <label htmlFor="tf-pw" className="text-sm font-medium">Password</label>
            <Input id="tf-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {disable.isError && <p role="alert" className="text-sm text-destructive">{disable.error.message}</p>}
            <Button type="submit" variant="destructive" disabled={disable.isPending || !password}>Turn off</Button>
          </form>
        ) : (
          <>
            {setup.isError && <p role="alert" className="text-sm text-destructive">{setup.error.message}</p>}
            <div className="flex gap-2">
              <Button onClick={start} disabled={setup.isPending}>Set up</Button>
              <Button variant="outline" onClick={() => setOff(true)}>Turn off</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function DevicesCard() {
  const logoutAll = useLogoutAll()
  const { data: scope } = useSessionScope()
  const impersonating = Boolean(scope?.impersonation)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Signed-in devices</CardTitle>
        <CardDescription>Sign out everywhere, including this device. You&apos;ll need to sign in again.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {impersonating && <p className="text-sm text-muted-foreground">Not available while viewing as someone else.</p>}
        {logoutAll.isError && <p role="alert" className="text-sm text-destructive">{logoutAll.error.message}</p>}
        <Button variant="outline" disabled={logoutAll.isPending || impersonating} onClick={() => logoutAll.mutate()}>Sign out of all devices</Button>
      </CardContent>
    </Card>
  )
}

export default function SecurityPage() {
  const { data: user } = useSession()
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Security</h1>
      {user && canImpersonate(user.role) ? <TwoFactorCard /> : (
        <p className="text-sm text-muted-foreground">Two-step sign-in is available to admin accounts.</p>
      )}
      <DevicesCard />
    </div>
  )
}
