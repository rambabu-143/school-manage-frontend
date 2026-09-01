"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/hooks/use-session"
import { ADMIN_ROLES } from "@/types/auth"

import { LeaveTab } from "./leave-tab"
import { ShiftsTab } from "./shifts-tab"

export default function HrPage() {
  const { data: user } = useSession()
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role)

  // Shifts is an admin-only config screen - non-admins only ever have one
  // usable tab, so skip the Tabs chrome entirely for them.
  if (!isAdmin) return <LeaveTab />

  return (
    <Tabs defaultValue="leave">
      <TabsList>
        <TabsTrigger value="leave">Leave</TabsTrigger>
        <TabsTrigger value="shifts">Shifts</TabsTrigger>
      </TabsList>
      <TabsContent value="leave">
        <LeaveTab />
      </TabsContent>
      <TabsContent value="shifts">
        <ShiftsTab />
      </TabsContent>
    </Tabs>
  )
}
