"use client"
import { ReportPage } from "@/components/ops/report-page"
import { DISCIPLINARY_CARDS } from "@/lib/ops/resources"
export default function Page() {
  return <ReportPage title="Disciplinary cards" reports={DISCIPLINARY_CARDS} />
}
