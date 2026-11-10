"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ApplicationsTab } from "./applications-tab"
import { BalancesTab } from "./balances-tab"
import { GradesTab } from "./grades-tab"
import { LeaveConfigTab } from "./leave-config-tab"
import { OverviewTab } from "./overview-tab"
import { PromotionTab } from "./promotion-tab"
import { ReportsTab } from "./reports-tab"
import { RolesTab } from "./roles-tab"
import { FlexiShiftsTab } from "./flexi-shifts-tab"

const TABS = [
  ["overview", "Overview", OverviewTab],
  ["config", "Leave types", LeaveConfigTab],
  ["grades", "Staff grades", GradesTab],
  ["roles", "Roles & approvers", RolesTab],
  ["balances", "Balances", BalancesTab],
  ["applications", "Applications", ApplicationsTab],
  ["reports", "Reports", ReportsTab],
  ["shifts", "Flexi shifts", FlexiShiftsTab],
  ["promotion", "Promotion", PromotionTab],
] as const

export default function HrAdminPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">HR administration</h1>
        <p className="text-sm text-muted-foreground">Leave policy, staff grades, roles, shifts and reports.</p>
      </div>
      <Tabs defaultValue="overview">
        <div className="overflow-x-auto">
          <TabsList>{TABS.map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}</TabsList>
        </div>
        {TABS.map(([v, , C]) => <TabsContent key={v} value={v}><C /></TabsContent>)}
      </Tabs>
    </div>
  )
}
