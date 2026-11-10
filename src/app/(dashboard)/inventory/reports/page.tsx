"use client"
import { ActionForm } from "@/components/ops/action-form"
import { ReportPage } from "@/components/ops/report-page"
import { INVENTORY_REPORTS, STOCK_IN } from "@/lib/ops/resources"
export default function Page() {
  return (
    <div className="space-y-6">
      <ReportPage title="Inventory reports" reports={INVENTORY_REPORTS} />
      <ActionForm cfg={STOCK_IN} />
    </div>
  )
}
