"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { usePayments, useRecordPayment } from "@/hooks/use-invoices"
import { useStudents } from "@/hooks/use-students"
import { PAYMENT_METHODS, type Invoice, type PaymentMethod } from "@/types/fees"

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  method: z.enum(PAYMENT_METHODS as [PaymentMethod, ...PaymentMethod[]]),
  paid_date: z.string().optional(),
})

type PaymentInput = z.input<typeof paymentSchema>
type PaymentValues = z.output<typeof paymentSchema>

function statusVariant(status: Invoice["status"]) {
  if (status === "paid") return "default" as const
  if (status === "overdue") return "destructive" as const
  return "secondary" as const
}

interface InvoiceDetailSheetProps {
  invoice: Invoice | null
  onOpenChange: (open: boolean) => void
}

export function InvoiceDetailSheet({ invoice, onOpenChange }: InvoiceDetailSheetProps) {
  const { data: students } = useStudents()
  const { data: payments, isPending: paymentsPending } = usePayments(invoice?.id)
  const recordPayment = useRecordPayment()

  const form = useForm<PaymentInput, unknown, PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: 0, method: "cash", paid_date: "" },
  })

  if (!invoice) return null

  const student = students?.find((s) => s.id === invoice.student_id)
  const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0
  const remaining = invoice.amount_due - totalPaid

  function onSubmit(values: PaymentValues) {
    if (!invoice) return
    recordPayment.mutate(
      {
        invoiceId: invoice.id,
        input: { ...values, paid_date: values.paid_date || null },
      },
      { onSuccess: () => form.reset({ amount: 0, method: "cash", paid_date: "" }) }
    )
  }

  return (
    <Sheet open={!!invoice} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {student ? `${student.first_name} ${student.last_name}` : "Invoice"}
          </SheetTitle>
          <SheetDescription>
            Due {invoice.due_date} &middot;{" "}
            <Badge variant={statusVariant(invoice.status)} className="capitalize">
              {invoice.status.replace("_", " ")}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div className="grid grid-cols-4 gap-3 rounded-md border p-3 text-sm">
            <div>
              <div className="text-muted-foreground">Amount</div>
              <div className="font-medium">{invoice.amount}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Discount</div>
              <div className="font-medium">{invoice.discount_amount}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Net payable</div>
              <div className="font-medium">{invoice.amount_due}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Remaining</div>
              <div className="font-medium">{remaining}</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label>Payments</Label>
            {paymentsPending && <p className="text-sm text-muted-foreground">Loading...</p>}
            {!paymentsPending && payments?.length === 0 && (
              <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
            )}
            {payments?.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div>
                  <div className="font-medium">{payment.amount}</div>
                  <div className="text-muted-foreground capitalize">
                    {payment.method.replace("_", " ")} &middot; {payment.paid_date}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {invoice.status !== "paid" && (
            <>
              <Separator />
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <Label>Record a payment</Label>
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            {...field}
                            value={field.value as number}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Method</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_METHODS.map((method) => (
                                <SelectItem key={method} value={method} className="capitalize">
                                  {method.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paid_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paid date</FormLabel>
                        <FormControl>
                          <Input type="date" placeholder="Defaults to today" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={recordPayment.isPending}>
                    {recordPayment.isPending && <Loader2 className="animate-spin" />}
                    <Plus />
                    Record payment
                  </Button>
                </form>
              </Form>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
