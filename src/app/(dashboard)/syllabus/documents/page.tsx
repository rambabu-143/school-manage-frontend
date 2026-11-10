"use client"
import { ActionForm } from "@/components/ops/action-form"
import { ResourcePage } from "@/components/ops/resource-page"
import { RESOURCES, SYLLABUS_UPLOAD } from "@/lib/ops/resources"
export default function Page() {
  return (
    <div className="space-y-6">
      <ActionForm cfg={SYLLABUS_UPLOAD} invalidate="syllabus-documents" />
      <ResourcePage res={RESOURCES.syllabusDocs} />
    </div>
  )
}
