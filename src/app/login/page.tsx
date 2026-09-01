"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { GraduationCap, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useLogin } from "@/hooks/use-session"
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

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type LoginValues = z.infer<typeof loginSchema>

// ponytail: dev-only convenience, remove before shipping.
const DEMO_LOGINS = [
  { label: "Admin", email: "admin@demoschool.io" },
  { label: "Teacher", email: "teacher@demoschool.io" },
  { label: "Parent", email: "parent@demoschool.io" },
] as const
const DEMO_PASSWORD = "DevPass123!"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useLogin()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(values: LoginValues) {
    login.mutate(values, {
      onSuccess: () => {
        router.replace(searchParams.get("next") ?? "/dashboard")
        router.refresh()
      },
    })
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
              <GraduationCap className="size-6" />
            </div>
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>School management system</CardDescription>
          </CardHeader>
          <CardContent>
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
                          disabled={login.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          disabled={login.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {login.isError && (
                  <p className="text-sm text-destructive">{login.error.message}</p>
                )}
                <Button type="submit" className="w-full" disabled={login.isPending}>
                  {login.isPending && <Loader2 className="animate-spin" />}
                  Sign in
                </Button>
                {process.env.NODE_ENV !== "production" && (
                  <div className="grid grid-cols-3 gap-2">
                    {DEMO_LOGINS.map((demo) => (
                      <Button
                        key={demo.email}
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={login.isPending}
                        onClick={() =>
                          form.reset({ email: demo.email, password: DEMO_PASSWORD })
                        }
                      >
                        {demo.label}
                      </Button>
                    ))}
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense>
      <LoginForm />
    </React.Suspense>
  )
}
