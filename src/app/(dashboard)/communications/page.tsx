"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { EmailTab } from "./email-tab"
import { GroupsTab } from "./groups-tab"
import { SmsTab } from "./sms-tab"
import { TemplatesTab } from "./templates-tab"

export default function CommunicationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Communications</h1>
        <p className="text-sm text-muted-foreground">
          Broadcast email and SMS through your school&apos;s own accounts.
        </p>
      </div>

      <Tabs defaultValue="email">
        <TabsList>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <EmailTab />
        </TabsContent>
        <TabsContent value="sms">
          <SmsTab />
        </TabsContent>
        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>
        <TabsContent value="groups">
          <GroupsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
