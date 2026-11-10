"use client"
import { ActionForm } from "@/components/ops/action-form"
import { ResourcePage } from "@/components/ops/resource-page"
import { NOMINATION_UPLOAD, RESOURCES } from "@/lib/ops/resources"
export default function Page() {
  return (
    <div className="space-y-6">
      <ActionForm cfg={NOMINATION_UPLOAD} invalidate="self-nomination-files" />
      <ResourcePage res={RESOURCES.nominationFiles} />
    </div>
  )
}
