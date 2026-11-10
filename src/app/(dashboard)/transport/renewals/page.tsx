"use client"
import { ActionForm } from "@/components/ops/action-form"
import { ReportPage } from "@/components/ops/report-page"
import { RENEWAL_NOTIFY, TRANSPORT_REPORTS } from "@/lib/ops/resources"
export default function Page() {
  return (
    <div className="space-y-6">
      <ReportPage title="Transport renewals" reports={TRANSPORT_REPORTS} />
      <ActionForm cfg={RENEWAL_NOTIFY} />
    </div>
  )
}
