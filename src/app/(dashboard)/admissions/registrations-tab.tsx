"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AdmOpsPanel } from "./adm-ops-panel"
import { SetupTab } from "./setup-tab"

/** Admission back office: registrations, reports, siblings/details, tally, setup. */
export function AdmissionBackOffice() {
  return (
    <Tabs defaultValue="registrations">
      <TabsList className="flex-wrap">
        <TabsTrigger value="registrations">Registrations</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="siblings">Siblings and details</TabsTrigger>
        <TabsTrigger value="tally">Tally</TabsTrigger>
        <TabsTrigger value="setup">Setup</TabsTrigger>
      </TabsList>
      <TabsContent value="registrations" className="pt-4"><AdmOpsPanel group="registrations" /></TabsContent>
      <TabsContent value="reports" className="pt-4"><AdmOpsPanel group="reports" /></TabsContent>
      <TabsContent value="siblings" className="pt-4"><AdmOpsPanel group="siblings" /></TabsContent>
      <TabsContent value="tally" className="pt-4"><AdmOpsPanel group="tally" /></TabsContent>
      <TabsContent value="setup" className="pt-4"><SetupTab /></TabsContent>
    </Tabs>
  )
}
