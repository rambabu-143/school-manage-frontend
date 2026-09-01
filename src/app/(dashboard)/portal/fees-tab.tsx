"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useChildInvoices } from "@/hooks/use-portal"
import { useCreatePaymentOrder, useVerifyPaymentOrder } from "@/hooks/use-payments"
import { useSession } from "@/hooks/use-session"
import { openRazorpayCheckout } from "@/lib/razorpay"
import type { Invoice } from "@/types/fees"

function statusVariant(status: Invoice["status"]) {
  if (status === "paid") return "default" as const
  if (status === "partial") return "secondary" as const
  return "outline" as const
}

function PayButton({ invoice }: { invoice: Invoice }) {
  const { data: user } = useSession()
  const createOrder = useCreatePaymentOrder()
  const verifyOrder = useVerifyPaymentOrder()
  const [paying, setPaying] = React.useState(false)

  async function onPay() {
    setPaying(true)
    try {
      const order = await createOrder.mutateAsync({ invoice_id: invoice.id })
      await openRazorpayCheckout({
        key: order.razorpay_key_id,
        amount: Math.round(Number(order.amount) * 100),
        currency: order.currency,
        order_id: order.gateway_order_id,
        name: "Fee Payment",
        description: `Invoice due ${invoice.due_date}`,
        theme: { color: "#0f172a" },
        handler: (response) => {
          verifyOrder.mutate({
            orderId: order.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
        },
        modal: { ondismiss: () => setPaying(false) },
      })
      // Checkout takes over from here (its own overlay) - user is prefilled
      // by the school's own Razorpay account settings, so no name/email
      // prefill is passed from here.
    } finally {
      setPaying(false)
    }
  }

  const isPending = paying || createOrder.isPending || verifyOrder.isPending

  return (
    <Button size="sm" onClick={onPay} disabled={isPending || !user}>
      {isPending && <Loader2 className="animate-spin" />}
      Pay Now
    </Button>
  )
}

export function FeesTab({ studentId }: { studentId: string }) {
  const { data: invoices, isPending } = useChildInvoices(studentId)

  if (isPending) return <p className="text-sm text-muted-foreground">Loading...</p>
  if (!invoices || invoices.length === 0) {
    return <p className="text-sm text-muted-foreground">No invoices yet.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Amount</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Net payable</TableHead>
          <TableHead>Due date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>{invoice.amount}</TableCell>
            <TableCell>{invoice.discount_amount}</TableCell>
            <TableCell>{invoice.amount_due}</TableCell>
            <TableCell>{invoice.due_date}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(invoice.status)} className="capitalize">
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {invoice.status !== "paid" && <PayButton invoice={invoice} />}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
