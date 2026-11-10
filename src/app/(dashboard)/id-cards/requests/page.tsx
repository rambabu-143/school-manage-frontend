"use client"
import { ReportPage } from "@/components/ops/report-page"
import { ResourcePage } from "@/components/ops/resource-page"
import { ID_CARD_REPORT, RESOURCES } from "@/lib/ops/resources"
export default function Page() {
  return (
    <div className="space-y-8">
      <ResourcePage res={RESOURCES.idCardRequests} />
      <ReportPage title="Requests by section" reports={ID_CARD_REPORT} />
    </div>
  )
}
