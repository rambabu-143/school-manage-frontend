"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useRequestPasswordReset } from "@/hooks/use-session"
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

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const requestReset = useRequestPasswordReset()

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  function onSubmit(values: ForgotPasswordValues) {
    requestReset.mutate(values.email)
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
            <CardTitle className="text-xl">Forgot password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requestReset.isSuccess ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="size-8 text-primary" />
                <p className="text-sm text-muted-foreground">
                  If that email is registered, a reset link is on its way. Check your inbox.
                </p>
                <Link href="/login" className="text-sm underline underline-offset-4">
                  Back to sign in
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="you@school.edu"
                            disabled={requestReset.isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={requestReset.isPending}>
                    {requestReset.isPending && <Loader2 className="animate-spin" />}
                    Send reset link
                  </Button>
                  <Link
                    href="/login"
                    className="block text-center text-sm text-muted-foreground underline underline-offset-4"
                  >
                    Back to sign in
                  </Link>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
