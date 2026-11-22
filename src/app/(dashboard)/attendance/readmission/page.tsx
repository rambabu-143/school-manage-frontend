"use client"
import { ReportPage } from "@/components/ops/report-page"
import { READMISSION_REPORT } from "@/lib/ops/resources"
export default function Page() {
  return <ReportPage title="Re-admission attendance" reports={READMISSION_REPORT} />
}
