"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { Switch } from "@/components/ui/switch"
import { usePaymentGatewayConfig, useSetPaymentGatewayConfig } from "@/hooks/use-payments"

const configSchema = z.object({
  key_id: z.string().min(1, "Required"),
  key_secret: z.string().min(1, "Required"),
  webhook_secret: z.string().min(1, "Required"),
  is_active: z.boolean(),
})
type ConfigValues = z.infer<typeof configSchema>

export function PaymentGatewayTab() {
  const { data: config, isPending } = usePaymentGatewayConfig()
  const setConfig = useSetPaymentGatewayConfig()

  const form = useForm<ConfigValues>({
    resolver: zodResolver(configSchema),
    values: {
      key_id: config?.key_id ?? "",
      key_secret: "",
      webhook_secret: "",
      is_active: config?.is_active ?? true,
    },
  })

  function onSubmit(values: ConfigValues) {
    setConfig.mutate(values)
  }

  if (isPending) return <p className="text-sm text-muted-foreground">Loading...</p>

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Razorpay</CardTitle>
        <CardDescription>
          Your school&apos;s own Razorpay account. Each school settles into its own account -
          this key is never shared across tenants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="key_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key ID</FormLabel>
                  <FormControl>
                    <Input placeholder="rzp_live_..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="key_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="webhook_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                  <FormLabel className="cursor-pointer">Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={setConfig.isPending} className="self-start">
              {setConfig.isPending && <Loader2 className="animate-spin" />}
              Save settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
