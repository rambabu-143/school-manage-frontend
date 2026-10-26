"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useConfirmPasswordReset } from "@/hooks/use-session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
  const token = useSearchParams().get("token")
  const confirmReset = useConfirmPasswordReset()

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  function onSubmit(values: ResetPasswordValues) {
    if (!token) return
    confirmReset.mutate({ token, newPassword: values.newPassword })
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Card className="shadow-lg">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <KeyRound className="size-6" />
            </div>
            <CardTitle className="text-xl">Reset password</CardTitle>
            <CardDescription>Choose a new password for your account</CardDescription>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-sm text-destructive">
                  This reset link is missing its token. Request a new one.
                </p>
                <Link href="/forgot-password" className="text-sm underline underline-offset-4">
                  Request a new link
                </Link>
              </div>
            ) : confirmReset.isSuccess ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="size-8 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Your password has been reset. You can sign in with it now.
                </p>
                <Link href="/login" className="text-sm underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            disabled={confirmReset.isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            disabled={confirmReset.isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {confirmReset.isError && (
                    <p className="text-sm text-destructive">{confirmReset.error.message}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={confirmReset.isPending}>
                    {confirmReset.isPending && <Loader2 className="animate-spin" />}
                    Reset password
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense>
      <ResetPasswordForm />
    </React.Suspense>
  )
}
