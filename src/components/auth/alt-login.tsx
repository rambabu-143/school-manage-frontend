"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGoogleLogin, useRequestOtp, useVerifyOtp } from "@/hooks/use-alt-login"
import type { LoginResult } from "@/types/auth"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

type GoogleId = {
  initialize: (o: { client_id: string; nonce: string; callback: (r: { credential: string }) => void }) => void
  renderButton: (el: HTMLElement, o: Record<string, string>) => void
}
declare global { interface Window { google?: { accounts: { id: GoogleId } } } }

function GoogleButton({ onResult, onError }: { onResult: (r: LoginResult) => void; onError: (m: string) => void }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const google = useGoogleLogin()
  const { mutate } = google

  React.useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false
    const init = async () => {
      const { nonce } = await fetch("/api/auth/google/nonce").then((r) => r.json())
      if (cancelled || !window.google || !ref.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID, nonce,
        callback: ({ credential }) => mutate(credential, { onSuccess: onResult, onError: (e) => onError(e.message) }),
      })
      window.google.accounts.id.renderButton(ref.current, { theme: "outline", size: "large", text: "signin_with" })
    }
    if (window.google) { init().catch(() => onError("Google sign-in isn't available right now.")); return () => { cancelled = true } }
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.onload = () => init().catch(() => onError("Google sign-in isn't available right now."))
    document.head.appendChild(script)
    return () => { cancelled = true }
  }, [mutate, onResult, onError])

  if (!GOOGLE_CLIENT_ID) return null
  return <div ref={ref} className="flex justify-center" aria-label="Sign in with Google" />
}

export function AltLogin({ onResult }: { onResult: (r: LoginResult) => void }) {
  const [phone, setPhone] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [sent, setSent] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const request = useRequestOtp()
  const verify = useVerifyOtp()
  const onError = React.useCallback((m: string) => setError(m), [])

  return (
    <div className="mt-4 space-y-3 border-t pt-4">
      <GoogleButton onResult={onResult} onError={onError} />
      {!open ? (
        <Button type="button" variant="ghost" className="w-full" onClick={() => setOpen(true)}>Parent? Sign in with your phone</Button>
      ) : !sent ? (
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); setError(null); request.mutate(phone, { onSuccess: () => setSent(true), onError: (er) => setError(er.message) }) }}>
          <label htmlFor="otp-phone" className="text-sm font-medium">Phone number</label>
          <Input id="otp-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button type="submit" className="w-full" disabled={request.isPending || !phone.trim()}>Send me a code</Button>
        </form>
      ) : (
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); setError(null); verify.mutate({ mobile: phone, otp }, { onSuccess: onResult, onError: (er) => setError(er.message) }) }}>
          <label htmlFor="otp-code" className="text-sm font-medium">6-digit code</label>
          <p className="text-xs text-muted-foreground">If this number is registered, a code is on its way.</p>
          <Input id="otp-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} />
          <Button type="submit" className="w-full" disabled={verify.isPending || otp.length !== 6}>Sign in</Button>
        </form>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
