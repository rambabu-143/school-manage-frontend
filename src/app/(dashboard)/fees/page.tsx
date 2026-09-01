"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ConcessionRenewalsTab } from "./concession-renewals-tab"
import { ConcessionsTab } from "./concessions-tab"
import { FeeHeadsTab } from "./fee-heads-tab"
import { InvoicesTab } from "./invoices-tab"
import { PaymentGatewayTab } from "./payment-gateway-tab"

export default function FeesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Fees</h1>
        <p className="text-sm text-muted-foreground">
          Fee heads, concessions, invoices, and payments.
        </p>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="fee-heads">Fee Heads</TabsTrigger>
          <TabsTrigger value="concessions">Concessions</TabsTrigger>
          <TabsTrigger value="concession-renewals">Concession Renewals</TabsTrigger>
          <TabsTrigger value="payment-gateway">Payment Gateway</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices">
          <InvoicesTab />
        </TabsContent>
        <TabsContent value="fee-heads">
          <FeeHeadsTab />
        </TabsContent>
        <TabsContent value="concessions">
          <ConcessionsTab />
        </TabsContent>
        <TabsContent value="concession-renewals">
          <ConcessionRenewalsTab />
        </TabsContent>
        <TabsContent value="payment-gateway">
          <PaymentGatewayTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
