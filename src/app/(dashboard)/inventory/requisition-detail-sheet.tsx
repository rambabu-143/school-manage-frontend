"use client"

import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useApproveRequisition,
  useFulfillRequisition,
  useRejectRequisition,
} from "@/hooks/use-requisitions"
import type { Product, Requisition } from "@/types/inventory"

function statusVariant(status: Requisition["status"]) {
  if (status === "fulfilled" || status === "approved") return "default" as const
  if (status === "rejected") return "destructive" as const
  return "secondary" as const
}

interface RequisitionDetailSheetProps {
  requisition: Requisition | null
  product: Product | undefined
  canReview: boolean
  onOpenChange: (open: boolean) => void
}

export function RequisitionDetailSheet({
  requisition,
  product,
  canReview,
  onOpenChange,
}: RequisitionDetailSheetProps) {
  const approve = useApproveRequisition()
  const reject = useRejectRequisition()
  const fulfill = useFulfillRequisition()

  if (!requisition) return null

  return (
    <Sheet open={!!requisition} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{product ? `${product.name} (${product.unit})` : "Requisition"}</SheetTitle>
          <SheetDescription>Quantity: {requisition.quantity}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div>
            <Badge variant={statusVariant(requisition.status)} className="capitalize">
              {requisition.status}
            </Badge>
            <p className="mt-2 text-sm">{requisition.reason}</p>
          </div>

          {canReview && requisition.status === "pending" && (
            <>
              <Separator />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={approve.isPending}
                  onClick={() => approve.mutate(requisition.id)}
                >
                  {approve.isPending && <Loader2 className="animate-spin" />}
                  Approve
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  disabled={reject.isPending}
                  onClick={() => reject.mutate(requisition.id)}
                >
                  {reject.isPending && <Loader2 className="animate-spin" />}
                  Reject
                </Button>
              </div>
            </>
          )}

          {canReview && requisition.status === "approved" && (
            <>
              <Separator />
              <Button disabled={fulfill.isPending} onClick={() => fulfill.mutate(requisition.id)}>
                {fulfill.isPending && <Loader2 className="animate-spin" />}
                Mark fulfilled
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
