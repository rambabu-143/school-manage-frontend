"use client"
import { ReportPage } from "@/components/ops/report-page"
import { PPR_REPORT } from "@/lib/ops/resources"
export default function Page() {
  return <ReportPage title="PPR report" reports={PPR_REPORT} />
}
