"use client"
import { ActionForm } from "@/components/ops/action-form"
import { ResourcePage } from "@/components/ops/resource-page"
import { EVENT_MAIL, RESOURCES } from "@/lib/ops/resources"
export default function Page() {
  return (
    <div className="space-y-6">
      <ResourcePage res={RESOURCES.eventEmailSettings} />
      <ActionForm cfg={EVENT_MAIL} />
    </div>
  )
}
