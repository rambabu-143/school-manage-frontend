"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ApplicationsTab } from "./applications-tab"
import { AdmissionAdminTabs } from "./admission-admin-tabs"
import { EnquiriesTab } from "./enquiries-tab"

export default function AdmissionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Admissions</h1>
        <p className="text-sm text-muted-foreground">Enquiries and admission applications.</p>
      </div>

      <Tabs defaultValue="enquiries">
        <TabsList>
          <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="admin">Registration, settings and reports</TabsTrigger>
        </TabsList>
        <TabsContent value="enquiries">
          <EnquiriesTab />
        </TabsContent>
        <TabsContent value="applications">
          <ApplicationsTab />
        </TabsContent>
        <TabsContent value="admin">
          <AdmissionAdminTabs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
