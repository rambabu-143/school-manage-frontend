"use client"
import { ResourcePage } from "@/components/ops/resource-page"
import { RESOURCES } from "@/lib/ops/resources"
export default function Page() { return <ResourcePage res={RESOURCES.transportRequests} /> }
