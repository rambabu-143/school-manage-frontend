"use client"
import { ActionForm } from "@/components/ops/action-form"
import { ReportPage } from "@/components/ops/report-page"
import { RoleGate } from "@/components/ops/role-gate"
import { INVENTORY_REPORTS, INVENTORY_REPORT_ROLES, STOCK_IN } from "@/lib/ops/resources"
export default function Page() {
  return (
    <div className="space-y-6">
      <RoleGate roles={INVENTORY_REPORT_ROLES} what="inventory reports">
        <ReportPage title="Inventory reports" reports={INVENTORY_REPORTS} />
        <ActionForm cfg={STOCK_IN} />
      </RoleGate>
    </div>
  )
}
