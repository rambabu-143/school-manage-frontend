"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useChildInvoices } from "@/hooks/use-portal"
import type { Invoice } from "@/types/fees"

function statusVariant(status: Invoice["status"]) {
  if (status === "paid") return "default" as const
  if (status === "overdue") return "destructive" as const
  return "secondary" as const
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
                {invoice.status.replace("_", " ")}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
