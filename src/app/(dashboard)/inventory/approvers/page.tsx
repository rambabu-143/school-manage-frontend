"use client"
import { ResourcePage } from "@/components/ops/resource-page"
import { RESOURCES } from "@/lib/ops/resources"

import { ChainEditor } from "./chain-editor"

export default function Page() {
  return (
    <>
      <ChainEditor />
      <ResourcePage res={RESOURCES.approvers} />
    </>
  )
}
